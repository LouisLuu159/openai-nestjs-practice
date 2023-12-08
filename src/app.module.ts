import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FunctionCallService } from './function-call.service';
import { TextGenService } from './text-gen.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, FunctionCallService, TextGenService],
})
export class AppModule { }
