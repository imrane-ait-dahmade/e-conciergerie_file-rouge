import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

@Schema()
export class Quartier {
    @Prop({ required: true })
    nom: string;
    @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'Ville' })
    ville: mongoose.Types.ObjectId;
    @Prop({ required: false })
    createdAt: Date;
    @Prop({ required: false })
    updatedAt: Date;
}

export const QuartierSchema = SchemaFactory.createForClass(Quartier);
