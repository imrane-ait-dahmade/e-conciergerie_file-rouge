import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class Pays {
    @Prop({ required: true, unique: true })
    nom: string;
    @Prop({ required: false })
    code: string;
    @Prop({ required: false })
    createdAt: Date;
    @Prop({ required: false })
    updatedAt: Date;
}

export const PaysSchema = SchemaFactory.createForClass(Pays);
