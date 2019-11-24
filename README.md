# BabelFix (beta)
Intended for English speakers, this extension logs the words you look up in the WordReference translation dictionary corresponding to a selected language, so you can later retrieve them for study, as well as providing some translation services through WordReference.

Press Ctrl+Shift+Z to view a the WordReference translations to English of a selected word, and log it for further study.

Press Ctrl+Shift+X to view the WordReference conjugation chart of a selected verb, conjugated however you remember it, and log it for further study (not applicable or available for some languages).

SUPPORTED LANGUAGES: French, Mandarin, and Spanish (Hopefully more will be added soon)

KNOWN ISSUES AND FIXES:
Chrome prevents extensions like BabelFix which use certain services from running when a 'chrome:// tab' is open. This prevents malicious extensions from changing the user interface that might be used to control them. If you've a 'chrome://' tab open—eg. the browser settings—close it and BabelFix should work.

BabelFix will ignore the keyboard shortcuts if they conflict with others. The ones given work for me, but it's entirely conceivable that's because of my unique computer configuration. I'm working on functionality to allow each user to set their own shortcuts.

----------VERSION HISTORY---------
Version 1.1.0: Displays errors more intelligently, changed keyboard shortcuts to better work with other extensions or newer version of Chrome. Took away support for logging every WordReference search until I can work out some kinks here. Added to popup.

Version 1.0.2: Fixed bugs where unwanted punctuation could get into longer searches

Version 1.0.1: Minor bug fixes and enhancements: no expanding white space above words, filters out punctuation. This will likely be the last update in a while since I have college to return to.

Version 1.0.0: Major bug fixes

Version 0.9.9: Selected words persist over long time periods, selected words can be cleared, and Ctrl+Shift+C can be used to used to view verb conjugations for any conjugation of a French verb.

Version 0.9.1: Selected text is stored in the extensions popup.html in a format easy to convert to Quizlet flashcards later.

Version 0.9.0: Selected text can be translated via a Ctrl+Shift+Y in a non-intrusive popup window.
