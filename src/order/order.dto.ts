import { ArrayMaxSize, ArrayMinSize, Equals, IsArray, IsNumberString, IsString, IsUUID } from 'class-validator';

export class PostOrderDto {
    @IsArray()
    @IsString({ each: true })
    @IsNumberString(undefined, { each: true })
    @ArrayMinSize(2)
    @ArrayMaxSize(2)
    public origin: [lat: string, lon: string];

    @IsArray()
    @IsString({ each: true })
    @IsNumberString(undefined, { each: true })
    @ArrayMinSize(2)
    @ArrayMaxSize(2)
    public destination: [lat: string, lon: string];

    public isValueValid() {
        return [this.origin[0], this.destination[0]].every(v => +v >= -90 && +v <= 90)
            && [this.origin[1], this.destination[1]].every(v => +v >= -180 && +v <= 180);
    }
}

export class PatchOrderBodyDto {
    @IsString()
    @Equals("TAKEN")
    public status: "TAKEN";
}

export class PatchOrderParamDto {
    @IsUUID()
    public id: string
}

export class GetOrderQueryDto {
    @IsNumberString()
    public page: string;

    @IsNumberString()
    public limit: string;

    public isValueValid() {
        return [this.page, this.limit].every(v => +v >= 1 && Math.floor(+v) === +v);
    }
}