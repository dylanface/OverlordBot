
class Interpreter {

    constructor(attachmentStyle, client) {
        this.client = client

        this.attachmentStyle = attachmentStyle
        this.reservedWords = [
            'if',
            'else',
            'loop',
            'return',
            'continue',
        ]
    }

    async interpret(code, message) {
        const lines = code.split('\n')
        for (let codeBlock of lines) {
            
        }
    }
}