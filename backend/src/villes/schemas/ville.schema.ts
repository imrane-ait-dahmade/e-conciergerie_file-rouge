import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

@Schema()
export class Ville {
    @Prop({ required: true })
    nom: string;
    @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'Pays' })
    pays: mongoose.Types.ObjectId;
    @Prop({ required: false })
    createdAt: Date;
    @Prop({ required: false })
    updatedAt: Date;
}

export const VilleSchema = SchemaFactory.createForClass(Ville);
