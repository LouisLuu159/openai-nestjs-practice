import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiTags } from '@nestjs/swagger';
import { TextGenService } from './text-gen.service';
import { FunctionCallService } from './function-call.service';

@ApiTags('Main')
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly textGenService: TextGenService,
    private readonly functionCallService: FunctionCallService,
  ) { }

  @Get()
  async getHello() {
    return this.appService.getHello();
  }

  @Get('gen-text')
  async genText() {
    return this.textGenService.generateText();
  }

  @Get('call-function')
  async callFunction() {
    return this.functionCallService.callFunction();
  }
}
