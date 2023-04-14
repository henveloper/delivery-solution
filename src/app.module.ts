import { Module } from '@nestjs/common';
import { OrderModule } from './order/order.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './order/order.entity';

@Module({
  imports: [
    OrderModule,
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.getOrThrow("MYSQL_HOST"),
        port: 3306,
        username: 'deliveryapp',
        password: configService.getOrThrow("MYSQL_PW"),
        database: 'delivery',
        entities: [Order],
        retryDelay: 10_000, // 10 seconds
      }),
    }),
  ],
})
export class AppModule { }
