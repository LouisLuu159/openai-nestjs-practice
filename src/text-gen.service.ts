import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';

@Injectable()
export class TextGenService {
    private openaiService: OpenAI
    constructor() {
        this.openaiService = new OpenAI();
    }

    async generateText() {
        const response = await this.openaiService.chat.completions.create({
            response_format: { type: 'json_object' },
            messages: [
                {
                    role: 'system',
                    content: 'You are a helpful assistant designed to output JSON.',
                },
                { role: 'user', content: 'Who won the world series in 2020?' },
            ],
            model: 'gpt-3.5-turbo-1106',
        });

        return response;
    }
}
