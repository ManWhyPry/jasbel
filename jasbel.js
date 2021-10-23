let iota_iter = 0
function iota(reset = false) {
    if (reset) iota_iter = 0
    iota_iter++
    return iota_iter - 1
}

const State_normal = iota(true)
const State_branch = iota()

const State_id = iota()
const State_description = iota()

const State_rem = iota()

const State_builtin = iota()
const State_number = iota()
const State_word = iota()

class JasbelInterpreter {
    #state
    #stack
    #instructions
    #stdout
    #builtins
    #words
    #sentence
    #nestLevel

    constructor() {
        this.#state = State_normal
        this.#stack = []
        this.#instructions = []
        this.#stdout = ''
        this.#builtins = new Map()

        this.#builtins.set('literal_builtin', () => {
            this.#state = State_builtin
        })
        this.#builtins.set('literal_number', () => {
            this.#state = State_number
        })

        this.#builtins.set('def', () => {
            this.#state = State_id
            this.#nestLevel = 1
            this.#sentence = []
        })

        this.#builtins.set('rem', () => {
            this.#nestLevel = 1
            this.#state = State_rem
        })

        this.#builtins.set('branch', () => {
            this.#state = State_branch
        })
        this.#builtins.set('branch?', () => {
            if (this.#stack.pop() == 0) {
                this.#state = State_branch
            }
        })

        this.#builtins.set('print_number', () => {
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
        this.#builtins.set('*', () => {
            const b = this.#stack.pop()
            const a = this.#stack.pop()
            this.#stack.push(a * b)
        })
        this.#builtins.set('/', () => {
            const b = this.#stack.pop()
            const a = this.#stack.pop()
            this.#stack.push(a / b)
        })
        this.#builtins.set('>>', () => {
            const b = this.#stack.pop()
            const a = this.#stack.pop()
            this.#stack.push(a >> b)
        })
        this.#builtins.set('<<', () => {
            const b = this.#stack.pop()
            const a = this.#stack.pop()
            this.#stack.push(a << b)
        })

        this.#builtins.set('==', () => {
            const b = this.#stack.pop()
            const a = this.#stack.pop()
            this.#stack.push(Number(a == b))
        })
        this.#builtins.set('!=', () => {
            const b = this.#stack.pop()
            const a = this.#stack.pop()
            this.#stack.push(Number(a != b))
        })
        this.#builtins.set('<', () => {
            const b = this.#stack.pop()
            const a = this.#stack.pop()
            this.#stack.push(Number(a < b))
        })
        this.#builtins.set('>', () => {
            const b = this.#stack.pop()
            const a = this.#stack.pop()
            this.#stack.push(Number(a > b))
        })
        this.#builtins.set('<=', () => {
            const b = this.#stack.pop()
            const a = this.#stack.pop()
            this.#stack.push(Number(a <= b))
        })
        this.#builtins.set('>=', () => {
            const b = this.#stack.pop()
            const a = this.#stack.pop()
            this.#stack.push(Number(a >= b))
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

        this.#builtins.set('clear', () => {
            this.#stdout = ''
        })
        this.#builtins.set('eval', () => {
            const string = []
            let char
            while (char = this.#stack.pop()) {
                string.push(char)
            }
            this.#instructions.push(...string.map(e => String.fromCharCode(e)).join('').match(/\S+/g).reverse())
        })

        this.#words = new Map()
        this.#sentence = []
        this.#nestLevel = 0
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

                    this.#stdout += 'unknown word: ' + current + '\n'
                    this.trace(current)
                    this.#instructions = []
                    this.#state = State_normal
                    return
                }

                case State_branch: {
                    this.#state = State_normal
                    break
                }

                case State_id: {
                    if (current == 'literal_builtin' || current == 'literal_number' || current == 'literal_word') {
                        this.#stdout += 'reserved word: ' + current + '\n'
                        this.trace(current)
                        this.#instructions = []
                        this.#state = State_normal
                        return
                    }

                    this.#sentence.push(current)
                    this.#state = State_description
                    break
                }

                case State_description: case State_description: {
                    if (current == 'end_def') {
                        this.#nestLevel--
                        if (this.#nestLevel == 0) {
                            const id = this.#sentence.shift()
                            this.#words.set(id, this.#sentence.reverse())
                            this.#state = State_normal
                            break
                        }
                    } else if (current == 'def') {
                        this.#nestLevel++
                    }

                    this.#sentence.push(current)
                    break
                }

                case State_rem: {
                    if (current == 'end_rem') {
                        this.#nestLevel--
                        if (this.#nestLevel == 0) {
                            this.#state = State_normal
                        }
                    } else if (current == 'rem') {
                        this.#nestLevel++
                    }
                    break
                }

                case State_builtin: {
                    if (this.#builtins.has(current)) {
                        this.#state = State_normal
                        this.#builtins.get(current)()
                        break
                    }

                    this.#stdout += 'unknown builtin: ' + current + '\n'
                    this.trace(current)
                    this.#instructions = []
                    this.#state = State_normal
                    return
                }

                case State_number: {
                    if (!isNaN(current)) {
                        this.#stack.push(Number(current))
                        this.#state = State_normal
                        break
                    }

                    this.#stdout += 'unknown number: ' + current + '\n'
                    this.trace(current)
                    this.#instructions = []
                    this.#state = State_normal
                    return
                }

                case State_word: {
                    if (this.#words.has(current)) {
                        this.#instructions.push(...this.#words.get(current))
                        break
                    }

                    this.#stdout += 'unknown word: ' + current + '\n'
                    this.trace(current)
                    this.#instructions = []
                    this.#state = State_normal
                    return
                }
            }
        }
    }

    get stdout() {
        return this.#stdout
    }
}
