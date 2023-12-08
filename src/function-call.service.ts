import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import {
    ChatCompletionMessageParam,
    ChatCompletionTool,
} from 'openai/resources';

@Injectable()
export class FunctionCallService {
    private openaiService: OpenAI;
    constructor() {
        this.openaiService = new OpenAI();
    }

    async callFunction() {
        const choices = await this.runConversation();
        return choices;
    }

    private getCurrentWeather(location, unit, temperature) {
        console.log('location: ', location);
        console.log('temperature: ', temperature);
        console.log('unit: ', unit);
        if (location.toLowerCase().includes('tokyo')) {
            return JSON.stringify({
                location: 'Tokyo',
                temperature,
                unit,
            });
        } else if (location.toLowerCase().includes('san francisco')) {
            return JSON.stringify({
                location: 'San Francisco',
                temperature,
                unit,
            });
        } else if (location.toLowerCase().includes('paris')) {
            return JSON.stringify({
                location: 'Paris',
                temperature,
                unit,
            });
        } else if (location.toLowerCase().includes('hanoi')) {
            return JSON.stringify({
                location: 'Hanoi',
                temperature,
                unit,
            });
        } else {
            return JSON.stringify({ location, temperature: 'unknown' });
        }
    }

    private async runConversation() {
        // Step 1: send the conversation and available functions to the model
        const messages: ChatCompletionMessageParam[] = [
            {
                role: 'user',
                content:
                    "What's the weather like in San Francisco, Tokyo, Hanoi and Paris?",
            },
        ];
        const tools: ChatCompletionTool[] = [
            {
                type: 'function',
                function: {
                    name: 'get_current_weather',
                    description: 'Get the current weather in a given location',
                    parameters: {
                        type: 'object',
                        properties: {
                            location: {
                                type: 'string',
                                description: 'The city and state, e.g. San Francisco, CA',
                            },
                            unit: { type: 'string', enum: ['celsius', 'fahrenheit'] },
                            temperature: {
                                type: 'integer',
                                description: 'Current temperature',
                            },
                        },
                        required: ['location', 'unit', 'temperature'],
                    },
                },
            },
        ];

        const response = await this.openaiService.chat.completions.create({
            model: 'gpt-3.5-turbo-1106',
            messages: messages,
            tools: tools,
            tool_choice: 'auto', // auto is default, but we'll be explicit
        });
        console.log(
            'response runConversation :',
            JSON.stringify(response, null, 2),
        );
        const responseMessage = response.choices[0].message;

        // Step 2: check if the model wanted to call a function
        const toolCalls = responseMessage.tool_calls;
        if (responseMessage.tool_calls) {
            // Step 3: call the function
            // Note: the JSON response may not always be valid; be sure to handle errors
            const availableFunctions = {
                get_current_weather: this.getCurrentWeather,
            }; // only one function in this example, but you can have multiple
            messages.push(responseMessage); // extend conversation with assistant's reply

            for (const toolCall of toolCalls) {
                const functionName = toolCall.function.name;
                const functionToCall = availableFunctions[functionName];
                const functionArgs = JSON.parse(toolCall.function.arguments);
                const functionResponse = functionToCall(
                    functionArgs.location,
                    functionArgs.unit,
                );
                messages.push({
                    tool_call_id: toolCall.id,
                    role: 'tool',
                    content: functionResponse,
                }); // extend conversation with function response
            }
            const secondResponse = await this.openaiService.chat.completions.create({
                model: 'gpt-3.5-turbo-1106',
                messages: messages,
            }); // get a new response from the model where it can see the function response

            return secondResponse;
        }
    }
}
