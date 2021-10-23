# jasbel
Just another stack based extensible language

## usage
write program tbat is built out of words, and press eval to run it.

## syntax

`word` is a sequence of symbols without whitespaces. Regex is `\S+`

`words` is a sequence of words splitted by spaces symbols.

`def` `id` `definition` `end_def` is definiton of new word named `id` and it will be expanded into `description` when computed.
`id` cannot be `end_def`.
Empty words are allowed.
Numbees are valid words too.
`def` is a word too, so it cannot define a new word without reaching it.
Also it can rewrite word with a new one.

Examples
```
def the_answer 42 end_def
def print print_num end_def
def 42 lie end_def
def lie 420 end_def
def empty_word end_def
```
With this definitions the program `the_answer print` will print `420`.

## builtins

```
print_num    prints the number at the top of the stack and pops it
print_char   prints ascii representation of the number at the top of the stack and pops it
+            sums two popped numbers at the top of the stack and pushes the result
-            subs two popped numbers at the top of the stack and pushes the result

TODO add more docs
```
