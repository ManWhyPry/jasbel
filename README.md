# jasbel
Just another stack based extensible language

## usage
write program tbat is built out of words, and press eval to run it.

## syntax
A program in Jasbel is a sequence of words splitted by spaces

Word is a sequence of symbols without any space within

Jasbel interpreter has 4 modes: normal, comment, and definition

In normal mode each word will be expanded or computed if it's builtin

In comment mode each word will be skipped before end_rem word.
Comments can be nested.

In definition mode first word will be a name of a new word and the rest before end_def will be description. Definitions can be nested.

Some examples:
```jaspel
34 35 + print_number rem -> will push 34 and 35, sum them and print it out. end_rem

def true 1 end_def rem true is 1 now end_rem
def print_420 420 print_number end_def

true if print_420 rem -> 420 end_rem
```

## builtins

```
literal_builtin   (--) Treats next word as builtin explicitly.      CANNOT BE OVERWRITTEN.
literal_number    (--) Treats next word as number explicitly.       CANNOT BE OVERWRITTEN.
literal_word      (--) Treats next word as defined word explicitly. CANNOT BE OVERWRITTEN.

def       (--) Defines a word. 
end_def   (--) Ends of defining a word.

rem       (--) Starts a comment
end_rem   (--) Ends a comment

branch    (--)   Skips next word.
branch?   (N --) Skips next word if N == 0.

print_number   (N --) Prints N as number
print_char     (N --) Prints N as char (UTF-16)

+    (N1 N2 -- R) R = N1 + N2
-    (N1 N2 -- R) R = N1 - N2
*    (N1 N2 -- R) R = N1 * N2
/    (N1 N2 -- R) R = N1 / N2
>>   (N1 N2 -- R) R = N1 >> N2
<<   (N1 N2 -- R) R = N1 << N2

true are 1
false are 0

==   (N1 N2 -- R) R = N1 == N2
!=   (N1 N2 -- R) R = N1 != N2
<    (N1 N2 -- R) R = N1 < N2
>    (N1 N2 -- R) R = N1 > N2
<=   (N1 N2 -- R) R = N1 <= N2
>=   (N1 N2 -- R) R = N1 >= N2

dup    (N -- N N)             Duplicates N
drop   (N --)                 Drops N
over   (N1 N2 -- N1 N2 N1)    Duplicates N1
rot    (N1 N2 N3 -- N2 N3 N1) Rotate N1, N2, and N3
swap   (N1 N2 -- N2 N1)       Swap N1 and N2

empty   (-- N)   Pushes 1 if stack is empty otherwise 0

#NON_STANDARD
trace   (--)     Prints trace info
clear   (--)     Clears the screen
eval    (?0N --) execute the ?0N string (string are reversed utf8 with 0 byte at the end)
```
