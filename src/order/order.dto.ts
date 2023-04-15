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

    static isValueValid(o: PostOrderDto) {
        return [o.origin[0], o.destination[0]].every(v => +v >= -90 && +v <= 90)
            && [o.origin[1], o.destination[1]].every(v => +v >= -180 && +v <= 180);
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

    static isValueValid(o: GetOrderQueryDto) {
        return [o.page, o.limit].every(v => +v >= 1 && Math.floor(+v) === +v);
    }
}