// Built-in local wordlist. Passwords containing any of these words (also when
// disguised with leet-speak like p@ssw0rd) are penalised.
// You can edit this file, OR (easier) add / import your own words from the
// extension's Options page. Lines starting with # are ignored.
self.PSC_BASE_WORDS = `
password passw0rd passcode admin administrator root login letmein welcome qwerty qwertyuiop asdfgh asdfghjkl
zxcvbn zxcvbnm azerty qazwsx 1qaz2wsx abc123 abcd1234 123456 1234567 12345678 123456789 1234567890 111111
000000 123123 654321 987654321 iloveyou monkey dragon master sunshine princess football baseball basketball
soccer hockey cricket shadow superman batman spiderman ironman trustno1 michael jennifer jordan hunter ranger
buster killer george harley charlie andrew thomas robert daniel jessica ashley nicole hannah matthew joshua
summer winter spring autumn freedom whatever computer internet secret cookie banana orange purple yellow
silver golden magic flower rainbow butterfly tiger lion eagle panda monster ninja pirate wizard samurai
starwars pokemon naruto goku mario zelda minecraft fortnite google facebook twitter instagram gmail yahoo
hotmail outlook apple microsoft amazon netflix youtube whatsapp linkedin github changeme default guest user
test testing demo sample temp temporary system server network access security private public hello hello123
india bangalore bengaluru karnataka mumbai delhi chennai hyderabad kolkata krishna ganesh shiva lakshmi
sachin dhoni kohli rohit bollywood cricketer mylove mypassword mysecret sweetheart babygirl lovely angel
heaven forever family friends friend baby honey sugar chocolate cherry pepper coffee pizza burger cheese
january february march april june july august september october november december monday tuesday wednesday
thursday friday saturday sunday london paris tokyo newyork california texas florida ferrari porsche mercedes
toyota honda yamaha suzuki bmw audi tesla jordan23 lakers yankees cowboys liverpool chelsea arsenal barcelona
madrid manchester ronaldo messi neymar
`.split(/\s+/);
