let iota_iter = 0
function iota(reset = false) {
    if (reset) iota_iter = 0
    iota_iter++
    return iota_iter - 1
}

const State_normal = iota(true)
const State_brabch = iota()
const State_id = iota()
const State_definition = iota()
const State_comment = iota()

class JasbelInterpreter {
    #state
    #stack
    #instructions
    #stdout
    #builtins
    #words
    #sentence
    #remNestLevel

    constructor() {
        this.#state = State_normal
        this.#stack = []
        this.#instructions = []
        this.#stdout = ''
        this.#builtins = new Map()
        this.#builtins.set('print_num', () => {
            this.#stdout += this.#stack.pop() + '\n'
        })
        this.#builtins.set('print_char', () => {
            this.#stdout += String.fromCharCode(this.#stack.pop())
        })
        this.#builtins.set('+', () => {
            const b = this.#stack.pop()
            const a = this.#stack.pop()
            this.#stack.push(a + b)
        })
        this.#builtins.set('-', () => {
            const b = this.#stack.pop()
            const a = this.#stack.pop()
            this.#stack.push(a - b)
        })
        this.#builtins.set('=', () => {
            const b = this.#stack.pop()
            const a = this.#stack.pop()
            this.#stack.push(Number(a == b))
        })
        this.#builtins.set('branch', () => {
            this.#state = State_brabch
        })
        this.#builtins.set('branch?', () => {
            if (this.#stack.pop() == 0) {
                this.#state = State_brabch
            }
        })
        this.#builtins.set('def', () => {
            this.#state = State_id
            this.#sentence = []
        })
        this.#builtins.set('dup', () => {
            const a = this.#stack.pop()
            this.#stack.push(a)
            this.#stack.push(a)
        })
        this.#builtins.set('drop', () => {
            this.#stack.pop()
        })
        this.#builtins.set('over', () => {
            const b = this.#stack.pop()
            const a = this.#stack.pop()
            this.#stack.push(a)
            this.#stack.push(b)
            this.#stack.push(a)
        })
        this.#builtins.set('rot', () => {
            const c = this.#stack.pop()
            const b = this.#stack.pop()
            const a = this.#stack.pop()
            this.#stack.push(b)
            this.#stack.push(c)
            this.#stack.push(a)
        })
        this.#builtins.set('swap', () => {
            const b = this.#stack.pop()
            const a = this.#stack.pop()
            this.#stack.push(b)
            this.#stack.push(a)
        })
        this.#builtins.set('empty', () => {
            this.#stack.push(Number(this.#stack.length == 0))
        })
        this.#builtins.set('trace', () => {
            this.trace('trace');
        })
        this.#builtins.set('rem', () => {
            this.#remNestLevel = 1
            this.#state = State_comment
        })
        this.#builtins.set('clear', () => {
            this.#stdout = ''
        })
        this.#words = new Map()
        this.#sentence = []
        this.#remNestLevel = 0
    }

    trace(instruction) {
        this.#stdout += 'state:\n'
        this.#stdout += this.#state + '\n'

        this.#stdout += 'stack:\n'
        this.#stdout += this.#stack.join(' ') + '\n'

        this.#stdout += 'insctructions:\n'
        this.#stdout += this.#instructions.concat(instruction).reverse().join(' ') + '\n'

        this.#stdout += 'words:\n'
        for (const [word, definition] of this.#words) {
            this.#stdout += word + ': ' + definition.slice().reverse().join(' ') + '\n'
        }
    }

    eval(string) {
        this.#instructions.push(...string.match(/\S+/g).reverse())
        while (this.#instructions.length) {
            const current = this.#instructions.pop()

            switch (this.#state) {
                case State_normal: {
                    if (this.#words.has(current)) {
                        this.#instructions.push(...this.#words.get(current))
                        break
                    }

                    if (this.#builtins.has(current)) {
                        this.#builtins.get(current)()
                        break
                    }

                    if (!isNaN(current)) {
                        this.#stack.push(Number(current))
                        break
                    }

                    this.#stdout += 'unknown word\n'
                    this.trace(current)
                    return
                }

                case State_brabch: {
                    this.#state = State_normal
                    break
                }

                case State_id: {
                    if (current == 'end_def') {
                        this.#stdout += 'word cannot be end_def\n'
                        this.trace(current)
                        return
                    }
                    this.#sentence.push(current)
                    this.#state = State_definition
                    break
                }
                case State_definition: {
                    if (current == 'end_def') {
                        const id = this.#sentence.shift()
                        this.#words.set(id, this.#sentence.reverse())
                        this.#state = State_normal
                        break
                    }

                    this.#sentence.push(current)
                    break
                }

                case State_comment: {
                    if (current == 'end_rem') {
                        this.#remNestLevel--
                        if (this.#remNestLevel == 0) {
                            this.#state = State_normal
                        }
                    } else if (current == 'rem') {
                        this.#remNestLevel++
                    }
                    break
                }
            }
        }
    }

    get stdout() {
        return this.#stdout
    }
}
