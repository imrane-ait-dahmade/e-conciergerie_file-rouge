"use client";

import {
  APIProvider,
  APILoadingStatus,
  Map,
  Marker,
  useApiLoadingStatus,
  useMap,
} from "@vis.gl/react-google-maps";
import { useCallback, useEffect, useMemo, useRef } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getGoogleMapsApiKey } from "@/lib/google-maps/env";
import {
  isLatLngPairComplete,
  isLatValid,
  isLngValid,
  parseCoordField,
} from "@/lib/validation/coordinates";
import { cn } from "@/lib/utils";

const DEFAULT_CENTER: google.maps.LatLngLiteral = { lat: 48.8566, lng: 2.3522 };
const MAP_LIBRARIES = ["places"] as const;

/** Lat/lng en texte pour permettre la saisie partielle (aligné sur react-hook-form). */
export type LocationPickerValue = {
  address: string;
  latitude: string;
  longitude: string;
};

export type LocationPickerLabels = {
  addressLineLabel: string;
  mapsLoading: string;
  mapsLoadError: string;
  mapsMissingKey: string;
  mapsSearchPlaceholder: string;
  mapsUseTypedCoords: string;
  mapsResetLocation: string;
  mapsPickerHint: string;
  formLatitude: string;
  formLongitude: string;
};

export type LocationPickerProps = {
  value: LocationPickerValue;
  onChange: (next: LocationPickerValue) => void;
  labels: LocationPickerLabels;
  disabled?: boolean;
  /** Si true, met à jour l’adresse après clic / glisser sur la carte (géocodage inverse). */
  reverseGeocode?: boolean;
  className?: string;
  /** Hauteur minimale du bloc carte */
  mapMinHeight?: string;
};

function MapPanSync({
  target,
  zoom = 15,
}: {
  target: google.maps.LatLngLiteral | null;
  zoom?: number;
}) {
  const map = useMap();
  useEffect(() => {
    if (!map || !target) return;
    map.panTo(target);
    map.setZoom(zoom);
  }, [map, target, zoom]);
  return null;
}

function MapClickHandler({
  disabled,
  onLatLng,
}: {
  disabled?: boolean;
  onLatLng: (lat: number, lng: number) => void;
}) {
  const map = useMap();
  const cbRef = useRef(onLatLng);
  useEffect(() => {
    cbRef.current = onLatLng;
  }, [onLatLng]);
  useEffect(() => {
    if (!map || disabled) return;
    const listener = map.addListener("click", (e: google.maps.MapMouseEvent) => {
      const ll = e.latLng;
      if (!ll) return;
      cbRef.current(ll.lat(), ll.lng());
    });
    return () => {
      listener.remove();
    };
  }, [map, disabled]);
  return null;
}

function reverseGeocode(
  lat: number,
  lng: number,
): Promise<string | undefined> {
  return new Promise((resolve) => {
    if (typeof google === "undefined" || !google.maps?.Geocoder) {
      resolve(undefined);
      return;
    }
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === "OK" && results?.[0]?.formatted_address) {
        resolve(results[0].formatted_address);
        return;
      }
      resolve(undefined);
    });
  });
}

function PlacesAutocompleteInput({
  value,
  onChange,
  disabled,
  placeholder,
  labels,
}: {
  value: LocationPickerValue;
  onChange: (next: LocationPickerValue) => void;
  disabled?: boolean;
  placeholder: string;
  labels: LocationPickerLabels;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const status = useApiLoadingStatus();
  const onChangeRef = useRef(onChange);
  const addressRef = useRef(value.address);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);
  useEffect(() => {
    addressRef.current = value.address;
  }, [value.address]);

  useEffect(() => {
    if (status !== APILoadingStatus.LOADED || !inputRef.current) return;
    if (typeof google === "undefined" || !google.maps?.places) return;

    const ac = new google.maps.places.Autocomplete(inputRef.current, {
      fields: ["geometry", "formatted_address", "name"],
    });

    const listener = ac.addListener("place_changed", () => {
      const place = ac.getPlace();
      const loc = place.geometry?.location;
      if (!loc) return;
      const lat = loc.lat();
      const lng = loc.lng();
      const addr =
        place.formatted_address?.trim() ||
        place.name?.trim() ||
        addressRef.current;
      onChangeRef.current({
        address: addr,
        latitude: String(lat),
        longitude: String(lng),
      });
    });

    return () => {
      google.maps.event.removeListener(listener);
    };
  }, [status]);

  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    if (el.value !== value.address) {
      el.value = value.address;
    }
  }, [value.address]);

  if (status === APILoadingStatus.FAILED) {
    return (
      <p className="text-sm text-destructive" role="alert">
        {labels.mapsLoadError}
      </p>
    );
  }

  return (
    <div className="grid gap-2">
      <Label htmlFor="location-picker-search">{labels.addressLineLabel}</Label>
      <input
        id="location-picker-search"
        ref={inputRef}
        type="text"
        disabled={disabled || status !== APILoadingStatus.LOADED}
        placeholder={placeholder}
        defaultValue={value.address}
        onBlur={(e) => {
          const next = e.target.value.trim();
          if (next !== value.address) {
            onChange({ ...value, address: next });
          }
        }}
        className={cn(
          "flex h-11 min-h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm",
          "ring-offset-background focus-visible:ring-2 focus-visible:ring-ring",
        )}
      />
      {status === APILoadingStatus.LOADING ? (
        <p className="text-xs text-muted-foreground">{labels.mapsLoading}</p>
      ) : null}
    </div>
  );
}

function InnerMap({
  value,
  onChange,
  disabled,
  reverseGeocode: doReverse,
  labels,
  mapMinHeight,
}: Omit<LocationPickerProps, "className">) {
  const latNum = parseCoordField(value.latitude);
  const lngNum = parseCoordField(value.longitude);

  const center = useMemo<google.maps.LatLngLiteral>(() => {
    if (
      latNum !== null &&
      lngNum !== null &&
      isLatValid(latNum) &&
      isLngValid(lngNum)
    ) {
      return { lat: latNum, lng: lngNum };
    }
    return DEFAULT_CENTER;
  }, [latNum, lngNum]);

  const showMarker =
    latNum !== null &&
    lngNum !== null &&
    isLatValid(latNum) &&
    isLngValid(lngNum);

  const handleMapLatLng = useCallback(
    async (lat: number, lng: number) => {
      if (disabled) return;
      let address = value.address;
      if (doReverse) {
        const rev = await reverseGeocode(lat, lng);
        if (rev) address = rev;
      }
      onChange({
        address,
        latitude: String(lat),
        longitude: String(lng),
      });
    },
    [disabled, doReverse, onChange, value.address],
  );

  const handleMarkerDragEnd = useCallback(
    async (e: google.maps.MapMouseEvent) => {
      if (disabled) return;
      const pos = e.latLng;
      if (!pos) return;
      const lat = pos.lat();
      const lng = pos.lng();
      let address = value.address;
      if (doReverse) {
        const rev = await reverseGeocode(lat, lng);
        if (rev) address = rev;
      }
      onChange({
        address,
        latitude: String(lat),
        longitude: String(lng),
      });
    },
    [disabled, doReverse, onChange, value.address],
  );

  const applyCoordInputs = () => {
    const lat = parseCoordField(value.latitude);
    const lng = parseCoordField(value.longitude);
    if (!isLatLngPairComplete(lat, lng)) return;
    if (!isLatValid(lat) || !isLngValid(lng)) return;
    if (lat !== null && lng !== null) {
      onChange({
        ...value,
        latitude: String(lat),
        longitude: String(lng),
      });
    }
  };

  const reset = () => {
    onChange({ address: "", latitude: "", longitude: "" });
  };

  return (
    <div className="grid gap-3">
      <PlacesAutocompleteInput
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={labels.mapsSearchPlaceholder}
        labels={labels}
      />

      <div
        className={cn(
          "relative overflow-hidden rounded-xl border border-border/60 bg-muted/20",
        )}
        style={{ minHeight: mapMinHeight ?? "240px" }}
      >
        <Map
          className="h-full min-h-[240px] w-full"
          defaultCenter={center}
          defaultZoom={showMarker ? 15 : 12}
          gestureHandling="cooperative"
          disableDefaultUI={false}
          clickableIcons={false}
        >
          <MapClickHandler disabled={disabled} onLatLng={handleMapLatLng} />
          <MapPanSync
            target={
              showMarker && latNum !== null && lngNum !== null
                ? { lat: latNum, lng: lngNum }
                : null
            }
          />
          {showMarker && latNum !== null && lngNum !== null ? (
            <Marker
              position={{
                lat: latNum,
                lng: lngNum,
              }}
              draggable={!disabled}
              onDragEnd={handleMarkerDragEnd}
            />
          ) : null}
        </Map>
      </div>

      <p className="text-xs text-muted-foreground">{labels.mapsPickerHint}</p>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={disabled}
          onClick={applyCoordInputs}
        >
          {labels.mapsUseTypedCoords}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled}
          onClick={reset}
        >
          {labels.mapsResetLocation}
        </Button>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <Label htmlFor="lp-lat">{labels.formLatitude}</Label>
          <Input
            id="lp-lat"
            type="text"
            inputMode="decimal"
            disabled={disabled}
            placeholder="ex. 48.8566"
            value={value.latitude}
            onChange={(e) => {
              onChange({ ...value, latitude: e.target.value });
            }}
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="lp-lng">{labels.formLongitude}</Label>
          <Input
            id="lp-lng"
            type="text"
            inputMode="decimal"
            disabled={disabled}
            placeholder="ex. 2.3522"
            value={value.longitude}
            onChange={(e) => {
              onChange({ ...value, longitude: e.target.value });
            }}
          />
        </div>
      </div>
    </div>
  );
}

/**
 * Carte + recherche d’adresse + marqueur pour sélectionner un point.
 * Charge l’API Google Maps avec `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`.
 */
export function LocationPicker({
  value,
  onChange,
  labels,
  disabled,
  reverseGeocode = true,
  className,
  mapMinHeight,
}: LocationPickerProps) {
  const apiKey = getGoogleMapsApiKey();

  if (!apiKey) {
    return (
      <div
        className={cn(
          "rounded-xl border border-dashed border-amber-500/50 bg-amber-500/10 px-4 py-3 text-sm text-amber-900 dark:text-amber-100",
          className,
        )}
      >
        {labels.mapsMissingKey}
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      <APIProvider apiKey={apiKey} libraries={[...MAP_LIBRARIES]}>
        <InnerMap
          value={value}
          onChange={onChange}
          disabled={disabled}
          reverseGeocode={reverseGeocode}
          labels={labels}
          mapMinHeight={mapMinHeight}
        />
      </APIProvider>
    </div>
  );
}
