const Alexa = require('ask-sdk-core');
const i18n = require('i18next');

// core functionality for fact skill
const GetNewFactHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    // checks request type
    return request.type === 'LaunchRequest'
      || (request.type === 'IntentRequest'
        && request.intent.name === 'GetNewFactIntent');
  },
  handle(handlerInput) {
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
    // gets a random fact by assigning an array to the variable
    // the random item from the array will be selected by the i18next library
    // the i18next library is set up in the Request Interceptor
    const randomFact = requestAttributes.t('FACTS');
    // concatenates a standard message with the random fact
    const speakOutput = requestAttributes.t('GET_FACT_MESSAGE') + randomFact;

    return handlerInput.responseBuilder
      .speak(speakOutput)
      // Uncomment the next line if you want to keep the session open so you can
      // ask for another fact without first re-opening the skill
      // .reprompt(requestAttributes.t('HELP_REPROMPT'))
      .withSimpleCard(requestAttributes.t('SKILL_NAME'), randomFact)
      .getResponse();
  },
};

const HelpHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
    return handlerInput.responseBuilder
      .speak(requestAttributes.t('HELP_MESSAGE'))
      .reprompt(requestAttributes.t('HELP_REPROMPT'))
      .getResponse();
  },
};

const FallbackHandler = {
  // The FallbackIntent can only be sent in those locales which support it,
  // so this handler will always be skipped in locales where it is not supported.
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && request.intent.name === 'AMAZON.FallbackIntent';
  },
  handle(handlerInput) {
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
    return handlerInput.responseBuilder
      .speak(requestAttributes.t('FALLBACK_MESSAGE'))
      .reprompt(requestAttributes.t('FALLBACK_REPROMPT'))
      .getResponse();
  },
};

const ExitHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && (request.intent.name === 'AMAZON.CancelIntent'
        || request.intent.name === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
    return handlerInput.responseBuilder
      .speak(requestAttributes.t('STOP_MESSAGE'))
      .getResponse();
  },
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);
    return handlerInput.responseBuilder.getResponse();
  },
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);
    console.log(`Error stack: ${error.stack}`);
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
    return handlerInput.responseBuilder
      .speak(requestAttributes.t('ERROR_MESSAGE'))
      .reprompt(requestAttributes.t('ERROR_MESSAGE'))
      .getResponse();
  },
};

const LocalizationInterceptor = {
  process(handlerInput) {
    // Gets the locale from the request and initializes i18next.
    const localizationClient = i18n.init({
      lng: handlerInput.requestEnvelope.request.locale,
      resources: languageStrings,
      returnObjects: true
    });
    // Creates a localize function to support arguments.
    localizationClient.localize = function localize() {
      // gets arguments through and passes them to
      // i18next using sprintf to replace string placeholders
      // with arguments.
      const args = arguments;
      const value = i18n.t(...args);
      // If an array is used then a random value is selected
      if (Array.isArray(value)) {
        return value[Math.floor(Math.random() * value.length)];
      }
      return value;
    };
    // this gets the request attributes and save the localize function inside
    // it to be used in a handler by calling requestAttributes.t(STRING_ID, [args...])
    const attributes = handlerInput.attributesManager.getRequestAttributes();
    attributes.t = function translate(...args) {
      return localizationClient.localize(...args);
    }
  }
};

const skillBuilder = Alexa.SkillBuilders.custom();

exports.handler = skillBuilder
  .addRequestHandlers(
    GetNewFactHandler,
    HelpHandler,
    ExitHandler,
    FallbackHandler,
    SessionEndedRequestHandler,
  )
  .addRequestInterceptors(LocalizationInterceptor)
  .addErrorHandlers(ErrorHandler)
  .withCustomUserAgent('sample/basic-fact/v2')
  .lambda();

const deData = {
  translation: {
    SKILL_NAME: 'Chuck norris lustige fakten',
    GET_FACT_MESSAGE: 'LocalHier sind deine Fakten: ',
    HELP_MESSAGE: 'Du kannst sagen, „Nenne mir einen Fakt über den Weltraum“, oder du kannst „Beenden“ sagen... Wie kann ich dir helfen?',
    HELP_REPROMPT: 'Wie kann ich dir helfen?',
    FALLBACK_MESSAGE: 'Die Weltraumfakten Skill kann dir dabei nicht helfen. Sie kann dir Fakten über den Raum erzählen, wenn du dannach fragst.',
    FALLBACK_REPROMPT: 'Wie kann ich dir helfen?',
    ERROR_MESSAGE: 'Es ist ein Fehler aufgetreten.',
    STOP_MESSAGE: 'Auf Wiedersehen!',
    FACTS:
      [
        'Chuck Norris streichelt keine Tiere, die Tiere streicheln sich selbst, wenn er in der Nähe ist...',
        'Chuck Norris braucht die Toilette nicht zu spülen. Er sagt einfach "Buh!" und schon haut die Scheiße von alleine ab.',
        'Chuck Norris hat mal der Erde einen Roundhouse-Kick verpasst. Sie dreht sich immer noch.',
        'Chuck Norris spricht während der Fahrt mit dem Busfahrer.',
        'Chuck Norris verwählt sich nicht. Wenn du abhebst, warst du am falschen Telefon.',
        'Chuck Norris hat einen Grizzlybär-Teppich. Der Bär lebt, hat bloß Angst, sich zu bewegen.',
        'Wenn Chuck Norris mit nassen Fingern an der Steckdose rumfummelt, kriegt das Kraftwerk einen Schlag.',
        'Chuck Norris entführt Aliens.',
        'Chuck Norris kann mit Durchfall furzen.',
        'Chuck Norris hat sich einmal im Wald verlaufen. Niemand hat den Wald jemals wiedergesehen.',
        'Wimpern hat Chuck Norris nicht. Das sind AUGENBÄRTE.',
        'Wenn Chuck Norris beim Schwarzfahren erwischt wird zahlt der Busfahrer die Strafe.',
        'Chuck Norris hat einmal die Jungferninseln besucht. Danach hießen die anders.',
        'Chuck Norris hat beim Rasieren die Klinge verletzt.',
        'Niemand kann seinen Ellbogen lecken. Chuck Norris kann beide lecken.',
        'Wenn Arnold Schwarzenegger sagt: „I will be back“. Sagt er im Prinzip nur, dass er kurz bei Chuck Norris um Rat fragt.',
        'Chuck Norris darf zwischen der weißen Linie und dem Zug stehen.',
        'Chuck Norris hat Sandpapier gezeigt, wie man so richtig rau sein kann.',
        'Chuck Norris nießt mit offenen Augen!',
        'Chuck Norris ist so gut bestückt...es reicht sogar für eine Fernbeziehung.',
        'Wenn Chuck Norris einen Raum betritt, stehen sogar die Stühle auf!',
        'Chuck Norris hat keine Pickel. Die hätten ohnehin zu viel Angst von Chuck Norris ausgedrückt zu werden.',
        'Chuck Norris hat bei seiner Geburt den Rahmen mit rausgerissen.',
        'Chuck Norris hat schon mehr Leute vermöbelt als IKEA!!',
        'Chuck Norris hat bei Burgerking einen Big Mac bestellt - und hat ihn ohne Wiederworte bekommen!',
        'Chuck Norris war bereits auf dem Mars. Das ist der Grund dafür, warum es dort kein Leben mehr gibt.',
        'Wenn Chuck Norris über die Wiese geht, riecht er nicht an Blumen, die Blumen riechen an ihm.',
        'Warum haben die Amerikaner sich entschieden Atombomben auf Japan abzuwerfen und nicht einfach Chuck Norris hinzuschicken \? Ist humaner!',
        'Chuck Norris spuckt Lamas ins Gesicht.',
        'Chuck Norris wurde letztens von der Polizei angehalten... Die Polizisten sind mit einer Verwarnung davon gekommen.',
        'Als Chuck Norris geboren wurde, sagte der Arzt zur Mutter: "Glückwunsch, es ist ein MANN!',
        'Chuck Norris Tochter hat ihre Jungfreulichkeit verloren. Am nächsten Tag hatte sie sie wieder.',
        'Chuck Norris kackt Lichtschwerter.',
        'Herr Norris benutzt keine Kondome, denn es gibt nichts, was vor ihm schützen könnte.',
        'Wenn du Chuck Noris fragst, wie späht es ist, sagt er 2 Sekunden. Wenn du fragst: "Was? 2 Sekunden?" hast du schon längst einen Roundhouse Kick in der Fresse.',
        'Wie trinkt Chuck Norris seinen Kaffee? Antwort: Schwarz ohne Wasser!',
        'Es kursiert das Gerücht, dass Chuck Norris gegen einen Piraten gekämpft und verloren haben soll. Die Wahrheit ist, dass Chuck Norris dieses Gerücht selbst verbreitet hat, um noch mehr Piraten anzulocken..',
        'Als Chuck Norris geboren wurde, hat er die Nabelschnur selbst durchgebissen.',
        'Manche erzählt sich, dass unter dem Bart von Chuck Norris kein Kinn ist, sondern eine dritte Faust.',
        'Chuck Norris kann Einbeinige tunneln!',
        'Wenn Chuck Norris ein Ei essen möchte, pellt er das Huhn.',
        'Was geht den Opfern von Chuck Norris als Letztes durch den Kopf: SEIN FUSS.',
        'Wenn Chuck Norris kommt, scheißt sich jeder in die Hosen. Und zwar in echt.',
        'Chuck Norris isst im Bus.',
        'Vor kurzem hat die Polizei Chuck Norris in seinem Auto angehalten, weil Chuck auf der Autobahn 200 statt 100 gefahren ist. Es kam schnell zu einer Einigung. Die Polizei durfte mit einer mündlichen Verwarnung weiterfahren.',
        'Egal was dir Chuck Norris kocht. Es schmeckt einfach gut!',
        'Endlich weiß man, warum sich das Universum ausdehnt. Alles versucht sich so weit wie möglich von Chuck Norris zu entfernen.',
        'Chuck Norris Hund sammelt seine Haufen selbst ein, weil sich Chuck für niemanden bückt.',
        'Wenn Chuck Norris zu seinem Hund “Sitz!” sagt, setzten sich all Leute, die es gehört haben.',
        'Chuck Norris Computertastatur hat keine Löschtaste.Chuck Norris macht keine Fehler.',
        'Chuck Norris bekommt auch Geld für Flaschen ohne Pfand.',
        'Kornkreise im Feld sind auch nur Orte, wo Chuck Norris seine Roundhouse-Kicks praktiziert.',
        'Chuck Norris darf vom Beckenrand springen.',
        'Angst vor Spinnen nennt man in Fachkreisen Arachnophobia. Angst vorm Fliegen nennt man Aerophobia. Angst vor Blut nennt man Hemophobia. Angst vor Chuck Norris nennt man vernünftig.',
        'Der einzige Grund, warum Chuck Norris noch nie einen Oscar bekommen hat ist, dass sich niemand traut, sich ihm mit einem Metallobjekt zu nähern.',
        'Leute träumen Alpträume. Alpträume träumen Chuck Norris.',
        'Bill Gates lebt in ständiger Angst, dass der PC von Chuck Norris abstürzt.',
        'Der wahre Grund, warum sich Hitler tötete, ist dass Hitler herausgefunden hat, dass Chuck Norris Jude ist.',
        'Chuck Norris fährt in England einfach auf der rechten Seite.',
        'Chuck Norris hat versucht Gewicht zu verlieren. Jedoch verliert Chuck niemals.',
        'Chuck Norris kann Drehtüren eintreten.',
        'Chuck Norris hat beim Pokern gewonnen, mit Pokemon-Karten.',
        'Alle Menschen malen den Teufel an die Wand, der Teufel aber malt Chuck Norris an die Wand.',
        'Chuck Norris hat russisches Roulette mit einem vollbeladene Revolver gespielt und gewonnen.',
        'Chuck isst keinen Honig, er kaut Bienen!',
        'Chuck Norris schläft nicht. Er wartet.',
        'Es gibt kein Steoride im Bodybuiling - Nur Menschen, die Chuck angehaucht hat.',
        'Chuck Norris kommt nie ins Haus rein! Das Haus hat Angst innere Blutungen zu kriegen.',
        'Das Universum dehnt sich aus weil Chuck Norris furzt.',
        'Warum sieht Chuck Norris im Spiegel nicht sein Spiegelbild? Es kann nur einen Chuck Norris geben!',
        'Chuck war Kamikaze-Pilot… 12 mal.',
        'Einmal hat Herr Norris eine ganze Torte gegessen, bevor ihm jemand sagen konnte, dass eine Stripperin drin war.',
        'Chuck Norris und Gott hatten mal einen Faustkampf. Hast du Gott jemals gesehen?',
        'Chuck Norris darf die Straße neben dem Zebrastreifen überqueren.',
        'Chuck Norris hatte mal einmal ein Wettrennen mit der Zeit. Die Zeit läuft immer noch.',
        'Chuck Norris darf bei Ikea auch die gelbe Tasche mitnehmen.',
        'Was ist der Unterschied zwischen Chuck N. und Gott? Gott kennt Gnade...',
        'Chuck Norris wurde von der hochgiftigen "Black Mamba" gebissen. Nach 3 Tagen Höllenqualen ist die Black Mamba verstorben.',
        'Chuck Norris ist heute nach Nord Korea gereist. Dort hat er gerade mit Kim Jong Un gesprochen. Kim verkündet morgen, einen wirklich lieben Führer zu bekommen.',
        'Chuck Norris hat keine Herzattacken. Kein Herz wäre so verrückt Chuck zu attackieren.',
        'Chuck Norris kann einen Hut aus einem Hasen zaubern.',
        'Besser mit Chuck Norris teilen als von Chuck Norris geteilt zu werden. ',
        'Chuck Norris spielte GTA 5. Er tötet 45 Menschen, klaut 21 Autos und tut es mit 7 Prostituierten (während das Spiel lädt).',
        'Chuck Norris war in der Hölle. Der Teufel ist vor Angst gestorben.',
        'Warum weinen Kinder wenn sie auf die Welt kommen, weil sie wissen dass sie eine Welt mit Chuck Norris betreten haben.',
        'Chuck Norris ist der Einzige, der die Zeit wirklich totschlagen kann.',
        'Chuck Norris ist so männlich, dass sogar seine Brusthaare Brusthaare haben.',
        'Wenn es wie Hühnchen riecht, wenn es wie Hühnchen aussieht und wenn es wie Hühnchen schmeckt, aber Chuck Norris sagt, es ist Rind, dann ist es Rind.'
      ],
  },
};

const dedeData = {
  translation: {
    SKILL_NAME: 'Chuck norris funny facten',
  },
};

const enData = {
  translation: {
    SKILL_NAME: 'Chuck Norris funny facts:',
    GET_FACT_MESSAGE: 'Here is a Chuck Norris fact: ',
    HELP_MESSAGE: 'You can say tell me a chuck norris funny fact, or, you can say exit... What can I help you with?',
    HELP_REPROMPT: 'What can I help you with?',
    FALLBACK_MESSAGE: 'The chuck norris funny fact can\'t help you with that.  It can help you discover facts about Chuck Norris if you say tell me a chuck norris funny fact. What can I help you with?',
    FALLBACK_REPROMPT: 'What can I help you with?',
    ERROR_MESSAGE: 'Sorry, an error occurred.',
    STOP_MESSAGE: 'Goodbye!',
    FACTS:
      [
        'Chuck Norris invented the bolt-action rifle, liquor, sexual intercourse, and football-- in that order.',
        'Chuck Norris is the only human being to display the Heisenberg uncertainty principle - you can never know both exactly where and how quickly he will roundhouse-kick you in the face.',
        'Chuck Norris invented a new martial arts style: Chuck-Will-Kill.',
        'Chuck Norris always knows the EXACT location of Carmen SanDiego.',
        'Chuck Norris can be unlocked on the hardest level of Tekken. But only Chuck Norris is skilled enough to unlock himself. Then he roundhouse kicks the Playstation back to Japan.',
        'Chuck Norris can exist in two or more places at the same time.',
        'Contrary to popular belief, there is indeed enough Chuck Norris to go around',
        'Chuck Norris invented a new martial arts style: Chuck-Will-Kill.',
        'Police label anyone attacking Chuck Norris as a Code 45-11.... A suicide.',
        'Contrary to popular belief, there is indeed enough Chuck Norris to go around.',
        'Chuck Norris doesnt have disk latency because the hard drive knows to hurry the hell up.',
        'The only thing you can beat Chuck Norris at is the number of times you have had your face kicked in.',
        'Chuck Norris once spit on a lizard. The result is tyrannosaurus rex.',
        'Never look a gift Chuck Norris in the mouth, because he will bite your damn eyes off.',
        'The Bermuda Triangle used to be the Bermuda Square, until Chuck Norris Roundhouse kicked one of the corners off.',
        'They once made Chuck Norris toilet paper. The only problem was that it wouldnt take shit from no one!',
        'Chuck Norris just says no to drugs. If he said yes, it would collapse Colombia\'s infrastructure.',
        'Chuck Norris knows everything there is to know - Except for the definition of mercy.',
        'Chuck Norris built a better mousetrap, but the world was too frightened to beat a path to his door.',
        'In an average living room there are 1,242 objects Chuck Norris could use to kill you, including the room itself.',
        'The pen is mighter than the sword, but only if the pen is held by Chuck Norris.',
        'Chuck Norris invented bacon by throwing a pig through a chain link fence.',
        'A man once asked Chuck Norris if his real name is \'Charles\'. Chuck Norris did not respond, he simply stared at him until he exploded.',
        'The word Kill was invented by Chuck Norris. Other words were Die, Beer, and What.',
        'Hakuna Matata is actually Swahili for all hail Chuck Norris.',
        'Most people have 23 pairs of chromosomes. Chuck Norris has 72... and they\'re all poisonous.',
        'Chuck Norris thinks inside the bun',
        'Chuck Norris is not Politically Correct. He is just Correct. Always.',
        'Think of a hot woman. Chuck Norris did her.',
        'The First rule of Chuck Norris is: you do not talk about Chuck Norris.',
        'Chuck Norris can watch TV...on his GameBoy...',
        'Chuck Norris CAN see John Cena.',
        'Chuck Norris did in fact, build Rome in a day.',
        'In the Bible, Jesus turned water into wine. But then Chuck Norris turned that wine into beer.',
        'Chuck Norris uses tabasco sauce instead of visine.',
        'Chuck Norris programs do not accept input.',
        'In the X-Men movies, none of the X-Men super-powers are done with special effects. Chuck Norris is the stuntman for every character.',
        'Chuck Norris doesn\'t believe in ravioli. He stuffs a live turtle with beef and smothers it in pig\'s blood.',
        'Chuck Norris invented manure spreaders.',
        'Chuck Norris finished World of Warcraft.',
        'Chuck Norris sleeps with a pillow under his gun.',
        'Hellen Keller\'s favorite color is Chuck Norris.',
        'If Chuck Norris had killed Kenny, he would have stayed dead.',
        'Chuck Norris likes his ice like he likes his skulls: crushed.',
        'Chuck Norris is not Irish. His hair is soaked in the blood of his victims.',
        'There is no such thing as global warming. Chuck Norris was cold, so he turned the sun up.',
        'If you spell Chuck Norris in Scrabble, you win. Forever.',
        'Chuck Norris\'s brain waves are suspected to be harmful to cell phones.',
        'Who knows what evil lurks in the hearts of men? Goddamn Chuck Norris, that\'s who.',
        'Chuck Norris\'s brain waves are suspected to be harmful to cell phones.',
        'Who knows what evil lurks in the hearts of men? Goddamn Chuck Norris, that\'s who.',
        'The crickets don\'t chirp at Chuck Norris house, if they know what\'s good for them.',
        'Chuck Norris doesn\'t read books. He stares them down until he gets the information he wants.',
        'When you say no one\'s perfect, Chuck Norris takes this as a personal insult.',
        'Chuck Norris chooses not to compete in an Ironman because of the swim, every time he starts kicking and swinging his arms, people die!',
        'Chuck Norris does not follow fashion trends, they follow him. But then he turns around and kicks their ass. Nobody follows Chuck Norris.',
        'Every SQL statement that Chuck Norris codes has an implicit \'COMMIT\' in its end.',
        'Chuck Norris doesnt shave; he kicks himself in the face. The only thing that can cut Chuck Norris is Chuck Norris.',
        'Chuck Norris crossed the road. No one has ever dared question his motives.',
        'The truth will set you free. Unless Chuck Norris has you, in which case, forget it buddy!',
        'Chuck Norris likes to perform surprise lobotomies with an ice-cream scoop.',
        'Little Miss Muffet sat on her tuffet, until Chuck Norris roundhouse kicked her into a glacier.',
        'Chuck Norris does not play the lottery. It doesn\'t have nearly enough balls.',
        'Since 1940, the year Chuck Norris was born, roundhouse kick related deaths have increased 13,000 percent.',
        'No matter which part of Chuck Norris you aim at, the bullet will always hit the center of your forehead.',
        'Chuck Norris roundhouse kicks don\'t really kill people. They wipe out their entire existence from the space-time continuum.',
        'Those aren\'t credits that roll after Walker Texas Ranger. It is actually a list of fatalities that occurred during the making of the episode.',
        'The show Survivor had the original premise of putting people on an island with Chuck Norris. There were no survivors, and nobody is brave enough to go to the island to retrieve the footage.',
        'Chuck Norris could order a steak at PETA\'s cafeteria and get one. But he\'s far more likely to kick the shit out of all the candy-asses in the place before roundhousing the building into rubble.',
        'A man once claimed Chuck Norris kicked his ass twice, but it was promptly dismissed as false - no one could survive it the first time.',
        'Chuck Norris owns a chain of fast-food restaurants throughout the southwest. They serve nothing but barbecue-flavored ice cream and Hot Pockets.',
        'Chuck Norris once lost the remote, but maintained control of the TV by yelling at it in between bites of his \'Filet of Child\' sandwich.',
        'Divide Chuck Norris by zero and you will in fact get one........one bad-ass that is.',
        'Chuck Norris will attain statehood in 2009. His state flower will be the Magnolia.',
        'Jack in the Box\'s do not work around Chuck Norris. They know better than to attempt to scare Chuck Norris',
        'They once made a Chuck Norris toilet paper, but there was a problem-- It wouldn\'t take shit from anybody.',
        'Chuck Norris is not dead yet because he knows Bruce Lee is waiting for him in the after life.',
        'Chuck Norris never goes to the dentist because his teeth are unbreakable. His enemies never go to the dentist because they have no teeth.',
        'Chuck Norris never wet his bed as a child. The bed wet itself out of fear.',
        'Chuck Norris\' gaydar is so finely tuned he can tell if you have EVER stared at another man\'s ass and will brutally kill you accordingly.',
        'Crime does not pay - unless you are an undertaker following Walker, Texas Ranger, on a routine patrol.',
        'Many rednecks and rual farmers enjoy Mountain Oysters as a special delicacy within their traditional menus. Chuck Norris, however, prefers to personally harvest and diet upon Mountain Gorilla Oysters.',
        'In the beginning there was nothing...then Chuck Norris Roundhouse kicked that nothing in the face and said \'Get a job\'. That is the story of the universe.',
        'When Chuck Norris kills you, the government fully covers all funeral expenses, as ordered by the  UN. It is the only truly good thing they have ever done.',
        'When Chuck Norris sends in his taxes, he sends blank forms and includes only a picture of himself, crouched and ready to attack. Chuck Norris has not had to pay taxes, ever.',
        'Chuck Norris keeps his friends close and his enemies closer. Close enough to drop them with one round house kick to the face.',
        'There are two types of people in the world... people that suck, and Chuck Norris.',
        'Chuck Norris\'s show is called Walker: Texas Ranger, because Chuck Norris doesn\'t run.',
        'Archeologists unearthed an old english dictionary dating back to the year 1236. It defined victim as one who has encountered Chuck Norris',
        'It is most common among people to believe that Hiroshima and Nagasaki were destroyed by nuclear bombs. Not so known fact is that Chuck Norris was spotted in Japan at that time supposedly having minor flatulance problem due to assassination attempt with uranium filled sushi. Hence the later radiation.',
        'The term \'Cleveland Steamer\' got its name from Chuck Norris, when he took a dump while visiting the Rock and Roll Hall of fame and buried northern Ohio under a glacier of fecal matter.',
        'If you rearrange the letters in Chuck Norris, they also spell Crush Rock In. The words with his fists are understood.',
        'Chuck Norris does not have to answer the phone. His beard picks up the incoming electrical impulses and translates them into audible sound.',
        'Chuck Norris is the only person who can simultaneously hold and fire FIVE Uzis: One in each hand, one in each foot -- and the 5th one he roundhouse-kicks into the air, so that it sprays bullets.',
        'How many roundhouse kicks does it take to get to the center of a tootsie pop? Just one. From Chuck Norris.',
        'According to the Encyclopedia Brittanica, the Native American Trail of Tears has been redefined as anywhere that Chuck Norris walks.',
        'Pick a number between 1 and 10. No matter what it is, you are wrong, and Chuck Norris is now on his way to brutally murder you.',
        'Human cloning is outlawed because of Chuck Norris, because then it would be possible for a Chuck Norris roundhouse kick to meet another Chuck Norris roundhouse kick. Physicists theorize that this contact would end the universe.',
        'Chuck Norris invented a language that incorporates karate and roundhouse kicks. So next time Chuck Norris is kicking your ass, don?t be offended or hurt, he may be just trying to tell you he likes your hat.',
        'Chuck Norris is currently suing NBC, claiming Law and Order are trademarked names.',
        'Chuck Norris can divide by zero.',
        'Chuck Norris can kill two stones with one bird.'

      ],
  },
};

const enusData = {
  translation: {
    SKILL_NAME: 'Chuck Norris Funny Facts',
  },
};

const esData = {
  translation: {
    SKILL_NAME: 'Chuck Norris hechos curiosos',
    GET_FACT_MESSAGE: 'Aquí está tu curiosidad: ',
    HELP_MESSAGE: 'Puedes decir dime una curiosidad del espacio o puedes decir salir... Cómo te puedo ayudar?',
    HELP_REPROMPT: 'Como te puedo ayudar?',
    FALLBACK_MESSAGE: 'La skill Chuck Norris hechos curiosos no te puede ayudar con eso.  Te puede ayudar a descubrir Chuck Norris hechos curiosos si dices dime una Chuck Norris hechos curiosos. Como te puedo ayudar?',
    FALLBACK_REPROMPT: 'Como te puedo ayudar?',
    ERROR_MESSAGE: 'Lo sentimos, se ha producido un error.',
    STOP_MESSAGE: 'Adiós!',
    FACTS:
      [
        'Los Dinosaurios miraron mal a Chuck Norris una vez. UNA VEZ.',
        'Chuck Norris murio hace 10 años, solo que La Muerte no ha tenido el valor de decirselo.',
        'Superman usa pijamas de Chuck Norris.',
        'Las lágrimas de Chuck Norris curan el cáncer. Es una pena que él no haya llorado nunca.',
        'Chuck Norris no duerme. Espera.',
        'Chuck Norris ha demandado a la NBC, alegando que Ley y Orden son marcas registradas para sus piernas derecha e izquierda.',
        'La principal exportación de Chuck Norris es el dolor.',
        'Si puedes ver a Chuck Norris, él puede verte. Si no puedes ver a Chuck Norris, puede que estés a sólo unos segundos de la muerte.',
        'Chuck Norris construyó una máquina del tiempo y viajó al pasado para evitar el asesinato de JFK.Cuando Oswald disparó, Chuck detuvo las tres balas con su barba, desviándolas.La cabeza de JFK estalló de la impresión.',
        'Chuck Norris vendió su alma al diablo a cambio de su rudo buen aspecto y su inigualable destreza en las artes marciales.Poco después de finalizar la transacción, Chuck dio una patada giratoria al Diablo en la cara y recuperó su alma.El Diablo, que aprecia la ironía, no pudo enfadarse con él, y admitió que debía haberla visto venir.Ahora juegan al póquer el segundo miércoles de cada mes.',
        'Chuck Norris no caza, porque la palabra caza implica la probabilidad de fracasar.Chuck Norris sale a matar',
        'De adolescente, Chuck Norris dejó embarazadas a todas las enfermeras de un convento perdido en las colinas de la Toscana.Nueve meses después, las enfermeras dieron a luz a los Miami Dolphins de 1972, el único equipo imbatido de la historia del fútbol americano profesional.',
        'Para demostrar que vencer el cáncer no es tan difícil, Chuck Norris se fumó 15 cartones de tabaco al día durante dos años, y desarrolló 7 tipos diferentes de cáncer, sólo para librarse de ellos haciendo flexiones durante 30 minutos.',
        'Una vez, un ciego pisó el zapato de Chuck Norris.Chuck le dijo "¿No sabes quién soy? ¡Soy Chuck Norris!" La mera mención de su nombre curó la ceguera del hombre.Desgraciadamente, la primera, última y única cosa que este hombre llegó a ver fue una mortal patada giratoria lanzada por Chuck Norris.',
        'Chuck Norris ha contado hasta el número infinito...dos veces.',
        'Cuando el Hombre del Saco se va a dormir cada noche, mira en su armario para ver si está Chuck Norris.',
        'Chuck Norris se comió una vez 3 filetes de 2 kilos en una hora.Pasó los primeros 45 minutos follando con su camarera.',
        'Una señal de aparcamiento para minusválidos no significa que ese sitio esté reservado para minusválidos.En realidad, es una advertencia de que el sitio pertenece a Chuck Norris, y que te quedarás minusválido si aparcas ahí.',
        'Cuando Chuck Norris manda su declaración de la renta, envía los formularios en blanco e incluye una foto suya, en guardia y listo para atacar.Chuck Norris nunca ha tenido que pagar sus impuestos.',
        'Chuck Norris es 1 / 8 Cherokee.No tiene nada que ver con sus antepasados, el tío se comió un puto indio.',
        'Alguien intentó decirle una vez a Chuck Norris que las patadas giratorias no son la mejor manera de dar una patada a alguien.Este hecho ha sido registrado por los historiadores como el peor error que nadie ha cometido jamás.',
        'El camino más rápido para llegar al corazón de un hombre es el puño de Chuck Norris.',
        'Las Tortugas Ninja están basadas en una historia real.Chuck Norris se comió una vez una tortuga entera, y cuando la cagó, ésta medía dos metros y había aprendido karate.',
        'Si Chuck Norris llega tarde, más le vale al tiempo ir más despacio.',
        'Si le preguntas a Chuck Norris qué hora es, siempre responde "Faltan dos segundos".Después de preguntarle "¿Dos segundos para qué?", te pega una patada giratoria en la cara.',
        'La novia de Chuck Norris le dijo una vez que tres tristes tigres tragan trigo en un trigal.Él le gritó "¿CÓMO TE ATREVES A HACER RIMAS EN PRESENCIA DE CHUCK NORRIS?", y le rajó la garganta.Sosteniendo el cuello sangrante de su novia en la mano, exclamó "Don\'t Fuck with Chuck"(intraducible juego de palabras).Dos años y cinco meses después se dio cuenta de la ironía de su frase, y se rió con tanta fuerza que todo el mundo a un radio de cien millas se quedó sordo.',
        'El único niño que ha podido sobrevivir a una patada giratoria de Chuck Norris fue Gary Coleman(el negrito de Arnold).No ha crecido desde entonces.',
        'Chuck Norris no lee libros.Los mira fijamente hasta que consigue la información que quiere.',
        'Chuck Norris dona sangre a la Cruz Roja frecuentemente.Sólo que nunca es la suya.',
        'Mientras rodaba Walker: Texas Ranger, Chuck Norris resucitó a un corderito, que había nacido muerto, frotando prolongadamente su barba contra la criatura.Poco después de que el animal volviera a la vida, Chuck Norris le dio una patada giratoria delante de todo el mundo, rompiéndole el cuello, para recordar a la multitud que lo que Chuck nos da, Chuck nos lo quita.',
        'Chuck Norris se comió una vez una tarta entera antes de que sus amigos pudieran decirle que había una bailarina dentro.',
        'Chuck Norris apostó una vez contra la NASA a que podía sobrevivir a una entrada en la atmósfera desde el espacio sin traje protector.El 19 de julio de 1999, un Chuck Norris desnudo reentró en la atmósfera terrestre recorriendo 14 estados y alcanzando una temperatura d\'00 grados .La NASA, avergonzada, publicó que había sido un meteorito, y le sigue debiendo una cerveza.',
        'Si miras a un espejo y dices "Chuck Norris" 3 veces, aparecerá y matará a toda tu familia...pero al menos habrás conseguido ver a Chuck Norris.',
        'Chuck Norris fue el Danny Tanner original en la comedia familiar "Padres Forzosos".Fue remplazado por Bob Saget después de un desafortunado incidente con las trillizas Olsen.',
        'En la última página del Libro Guinness de los Récords se avisa que todos los récords mundiales pertenecen a Chuck Norris, y aquellos listados en el libro son solo los más cercanos que nadie ha podido conseguir jamás.',
        'No hay mentón tras la barba de Chick Norris.Tan sólo hay otro puño.',
        'Chuck Norris propinó una patada giratoria tan fuerte a un hombre que su pie superó la velocidad de la luz, volvió atrás en el tiempo y mató a Amelia Earhart mientras volaba sobre el Oceáno Pacífico.',
        'Los círculos extraterrestres conocidos como CROP CIRCLES son la forma de Chuck Norris de decirle al mundo que a veces el maíz tiene que estar tendido un maldito rato.',
        'Chuck Norris mide 3 metros de alto, pesa dos toneladas, respira fuego y se puede comer un martillo y aguantar en pie un tiro de escopeta.',
        'La Gran Muralla China fue creada originariamente para mantener alejado a Chuck Norris.Fracasó miserablemente.',
        'Chuck Norris conduce un cochecito de los helados cubierto de calaveras humanas.',
        'No hay teoría de la evolución, solo una lista de criaturas a las que Chuck Norris permite vivir.',
        'Chuck Norris es el único hombre vivo que ha derrotado a un muro de ladrillos en un partido de tenis.',
        'Chuck Norris no hace mantequilla, propina patadas giratorias a las vacas y la mantequilla sale de ellas.',
        'Chuck Norris alcanzará el nivel de Estado en 2.',
        'Su flor estatal será la Magnolia.',
        'Nagasaki nunca recibió una bomba atómica. Chuck Norris saltó de un avión y dio un puñetazo en la tierra.',
        'Chuck Norris aparecía originalmente en el juego "Street Fighter II", pero fue eliminado por los Beta Testers porque cada botón hacía que diera una patada giratoria. Cuando se le preguntó por este "fallo en el sistema" Norris respondió "Eso no es un fallo en el sistema".',
        'La escena inicial de la película "Salvar al soldado Ryan" está basada en los partidos de balón prisionero que Chuck Norris jugaba en segundo grado.',
        'Chuck Norris derribó en una ocasión un avión alemán con su dedo gritando "Bang!',
        'Chuck Norris tiene dos velocidades: Caminar y Matar.',
        'Contrariamente a la creencia popular, América no es una democracia. Es una Chucktadura.',
        'Chuck Norris no está colgado como un caballo, los caballos están colgados como Chuck Norris.',
        'Chuck Norris es el único ser humano en demostrar el principio de incertidumbre de Heisenberg: nunca puedes saber con exactitud dónde y a qué velocidad te dará una patada giratoria en la cara.',
        'Chuck Norris puede beber un galón entero de leche en 45 segundos.',
        'En lugar de ser parido como un bebé normal, Chuck Norris decidió abrirse paso a puñetazos desde el vientre de su madre.',
        'Si dices "Chuck Norris" en Mongolia, la gente te dará patadas giratorias en su honor. Sus patadas será seguidas por la VERDADERA patada giratoria, propinada por nadie más que el mismísimo Norris.',
        'El tiempo no espera a nadie. A no ser que el hombre sea Chuck Norris.',
        'Chuck Norris descubrió una nueva teoría de la relatividad acerca de múltiples universos en los que Chuck Norris es mucho más duro que en este. Cuando fue descubierta por Albert Einstein y hecha pública, Chuck Norris le dio una patada giratoria en la cara. Ahora conocemos a Albert Einstein como Stephen Hawking.',
        'La unidad militar Chuck Norris no fue usada en el juego Civilization 4 porque un solo Chuck Norris podría derrotar a la combinación de naciones del mundo en un solo turno.',
        'En un salón corriente hay unos 1242 objetos que Chuck Norris podría usar para matarte, incluido al mismo salón.',
        'Chuck Norris no se afeita, se da patadas en la cara. Lo único que corta a Chuck Norris es Chuck Norris.',
        'Chuck Norris perdió la virginidad antes que su padre.',
        'Chuck Norris vende su orina en lata. Se le conoce como Red Bull.',
        'Chuck Norris gana en el Monopoly sin comprar propiedades.',
        'Chuck Norris puede dividir entre cero.',
        'Chuck Norris no se moja en la lluvia: Es el agua la que se impregna de Chuck.',
        'Cuando Chuck Norris corre con unas tijeras abiertas en la mano apuntando hacia su cara y tropieza, no es él sino el resto de la gente la que se hace daño.',
        'Cuando Chuck Norris va a donar sangre no usa jeringuillas: Pide un cubo y un cuchillo.',
        'No existen minusválidos sino gente que ha peleado con Chuck Norris.',
        'Chuck Norris puede quemar una hormiga con una lupa...de noche.',
        'Chuck Norris es la razón por la que Wally se esconde.',
        'Chuck Norris es la única persona que le gana a una pared jugando al frontón.',
        'Chuck Norris ha estado en Marte, es por ello no hay signos de vida.',
        'De noche, Chuck Norris duerme con luz. No porque tenga miedo a la oscuridad, sino porque la oscuridad teme a Chuck Norris.',
        'Chuck Norris no salta, es la tierra la que se cae con la fuerza de sus piernas.',
        'Chuck Norris no esquiva las balas, las balas esquivan a Chuck Norris.',
        'Bigfoot no existe por que Chuck Norris se lo comió.',
        'Una vez un hombre preguntó si su nombre era Charles. Chuck no respondió, simplemente se le quedó mirando hasta que el hombre explotó en 34756294 pedazos.',
        'Los créditos de "Walker de Texas" son en realidad una lista de la gente que Chuck Norris pateó(y por lo tanto, mató) ese día.',
        'Chuck Norris gano la Primera Guerra Mundial el solo.',
        'Chuck Norris pidió un Big Mac en un Burger King y le hicieron uno.',
        'Chuck Norris jamás sufre estreñimiento, las heces huyen del cuerpo de Chuck.',
        'Chuck Norris no lee el periódico, lo estudia.',
        'Chuck Norris no grita, lanza ultrasonidos explota cerebros.',
        'Chuck Norris violó al Diablo sólo para oírle gritar.',
        'Chuck Norris obligó a Vin Diesel a protagonizar.',
        'Un canguro superduro.',
        'En una pelea entre Batman y Darth Vader, el ganador sería Chuck Norris.',
        'Una patada voladora de Chuck Norris es el metodo preferido de ejecución en 16 estados.',
        'En el comienzo fue la nada. Entonces Chuck Norris le dió una patada en la cara y le dijo "buscate un trabajo". Así empezó el universo.',
        'La idea inicial de Supervivientes era poner a un grupo de gente en una isla con Chuck Norris. Como no hubo supervivientes, el episodio piloto nunca se ha emitido.',
        'El triangulo de las bermudas era un cuadrado hasta que CHuck norris le jodió una esquina de una patada.',
        'James Cameron pensó en Chuck Norris para el papel de Terminator, pero se dió cuenta que parecería un documental y eligió a Arnold Schwarzenegger.',
        'Chuck Norris no hace el pino, empuja la tierra para abajo.',
        'Godzilla es un homenaje de su primera visita a Tokio.',
        'Cuando Bruce Banner se cabrea, se transforma en Hulk. Cuando Hulk se cabrea, se transforma en Chuck Norris.',
        'Chuck norris una vez pateo a un caballo en la barbilla. Sus descendientes son conocidos hoy en dia como jirafas.',
        'No todo el mundo que se enfrenta a chuck norris muere. Algunos se alejan. Son llamados astronautas.',
        'Se dice que cada vez que te mastubras, dios mata a un gatito. Cada vez que se masturba dios, Chuck Norris mata a un leon.',
        'Chuck Norris puede ganar un juego de conecta 4 en 3 movimientos.',
        'Chuck Norris lleva sandalias con calcetines porque nadie, NUNCA, se ha atrevido a decirle nada.',
        'Cientificos han estimado que la energía desprendida durante el Big Bang es casi 1PDCN(1 patada de Chuck Norris',
        'Chuck Norris no escribe libros, las palabras se juntan por miedo.',
        'Aunque la tercera ley de Newton dice que hay una reacción por cada acción, no hay reacción a una patada de Chuck Norris.',
        'Chuck Norris tiene un profundo respeto por la vida humana...a menos que se interponga en su camino.',
        'Sus patadas no matan a nadie, solo los eliminan del continuo espacio - tiempo.',
        'Las 3 mayores causas de muerte en los Estados Unidos son: cancer, infarto, Chuck Norris.',
        'Chuck norris tiene la mejor cara de poquer de todos los tiempos.Gano las world series de poquer de 1983, a pesar de tener una mano compuesta por un joker, una de "Queda libre de la carcel" del monopoly, 2 tarjetas de club, un siete de espadas y una tarjeta verde numero 4 del juego UNO.',
        'Chuck Norris jugó a la ruleta rusa con un revolver completamente cargado y ganó.'
      ],
  },
};

const esesData = {
  translation: {
    SKILL_NAME: 'Chuck Norris hechos curiosos',
  },
};

const itData = {
  translation: {
    SKILL_NAME: 'Fatti divertenti su Chuck Norris',
    GET_FACT_MESSAGE: 'Ecco il tuo fatto: ',
    HELP_MESSAGE: 'Puoi chiedermi un Fatto divertenti su Chuck Norris o puoi chiudermi dicendo "esci"... Come posso aiutarti?',
    HELP_REPROMPT: 'Come posso aiutarti?',
    FALLBACK_MESSAGE: 'Non posso aiutarti con questo. Posso aiutarti a scoprire fatti e aneddoti sul Chuck Norris, basta che mi chiedi di dirti un aneddoto. Come posso aiutarti?',
    FALLBACK_REPROMPT: 'Come posso aiutarti?',
    ERROR_MESSAGE: 'Spiacenti, si è verificato un errore.',
    STOP_MESSAGE: 'A presto!',
    FACTS:
      [
        'Quando Chuck Norris tira un pugno al muro, sanguina.Il muro.',
        'La prima parola pronunciata da Chuck Norris da piccolo, è stata “Chuck”. La seconda “Norris”. La terza non c’è mai stata. Da quel giorno, Chuck Norris si esprime a calci rotanti.',
        'Chuck Norris per presentarsi: “Il mio nome è Norris. Chuck Norris.”',
        'Chuck Norris non piange, suda dagli occhi.',
        'Chuck Norris usa i preservativi stimolanti a rovescio, cosi gode lui.',
        'Dopo una attenta analisi il presidente Truman decise di lanciare la bomba atomica su Hiroshima piuttosto che mandare Chuck Norris. La motivazione? Era stata ritenuta la soluzione più umana.',
        'Chuck Norris da vero gentiluomo non chiede mai l’età a una donna. La sega a metà e conta i cerchi..',
        'Chuck Norris ha perso la verginità prima di suo padre.',
        'Chuck Norris può sgommare in folle.',
        'Chuck Norris ha aperto quella porta.',
        'Chuck Norris è il Lato Oscuro del Lato Oscuro della Forza.',
        'Chuck Norris usa come ventilatore il Mulino Bianco.',
        'Chuck Norris ha stabilito il nuovo record di mondiale di salto in alto. Per ufficializzare il primato stanno tutt’ora aspettando che atterri.',
        'Quando Chuck Norris capisce fischi per fiaschi, i fiaschi per non contraddirlo si tramutano in fischi all’istante.',
        'Quando sul suo pickup Chuck Norris aziona le quattro frecce, non è per indicare che sta per fermarsi, ma per indicare che sta per svoltare in quattro direzioni diverse.',
        'Chuck Norris può distrarre Coccolino Concentrato.',
        'Chuck Norris può cancellare il cestino di Windows.',
        'Le ciabatte di Chuck Norris sono addestrate a riportargli il cane quando serve.',
        'Durante una partita al Gioco dei Mimi, per far indovinare “Hitler” alla sua squadra, Chuck Norris ha invaso la Polonia.',
        'Alle ditte produttrici di Viagra, arriva lo spam di Chuck Norris.',
        'Quando fa footing, Chuck Norris indossa un paio di Puma. Vivi.',
        'Ozzy Osbourne, con un morso, ha staccato la testa ad un pipistrello. Chuck Norris, con un morso, ha staccato la testa a Batman.', 'Se Chuck Norris scoreggia in ascensore, tutti i presenti automaticamente si dichiarano colpevoli. E Chuck Norris prontamente li uccide con un calcio rotante. Nessuno scoreggia in presenza di Chuck Norris: nessuno.',
        'Quando la matrigna di Biancaneve ha chiesto allo specchio chi fosse la più bella del reame, lo specchio ha risposto “Chuck Norris”.',
        'Atlantide è stata sommersa dalle acque quando Chuck Norris, interrogato in geografia, si è ricordato solo di cinque continenti su sei.',
        'Una volta Chuck Norris, attraversando la strada sulle strisce pedonali, ha travolto e ucciso un ubriaco al volante.',
        'Da piccolo, quando Chuck Norris litigava coi suoi genitori, li mandava a letto senza cena.',
        'Chuck Norris non legge libri, li fissa finché non ottiene le informazioni che vuole',
        'Chuck Norris non chiede se puo fumare, sono gli altri a dover chiedere a lui il permesso per respirare.',
        'Se Chuck Norris guarda in faccia la realtà, lei abbassa lo sguardo.',
        'Chuck Norris può sbattere una porta girevole.',
        'Le persone comuni vanno dal dentista per la pulizia dei denti dal tartaro. Chuck Norris mette il pugno davanti alla bocca e il tartaro salta fuori da solo.',
        'Quelli che scorrono alla fine di ogni puntata di Walker Texas Ranger non sono i titoli di coda, sono i nomi delle persone che Chuck Norris ha ucciso nelle due ore precedenti al termine della puntata.',
        'Se all’alba Chuck Norris ha ancora sonno e vuole dormire, il sole chiede scusa e tramonta di nuovo dalla stessa parte.',
        'Chuck Norris può portare una donna all’orgasmo semplicemente indicandola con un dito e dicendo “ravanello”.',
        'Tra i ragazzi va di moda appendere dei pupazzetti al cellulare. Chuck Norris ha appeso al suo cellulare un orso di 315 kg. Vivo.',
        'È stato Chuck Norris a dire ai suoi genitori che Babbo Natale non esiste.',
        'Quando Chuck Norris fa le flessioni, non alza se stesso, abbassa la Terra.',
        'Chuck Norris invented manure spreaders.',
        'Chuck Norris di notte gira con una pila, non perchè abbia paura del buio, ma perchè il buio ha paura di Chuck Norris.',
        'Chuck Norris non ha letto la bibbia. L’ha scritta.',
        'Chuck Norris una volta ha calciato un cavallo sul mento. Ora i suoi discendenti sono noti come “giraffe”.',
        'Non ci sono disabili. Solo persone che hanno incontrato Chuck Norris.',
        'Chuck Norris non ha le maniglie dell’amore, ha le maniglie dell’odio.',
        'Chuck Norris può dividere per zero.',
        'Se chiedete l’ora a Chuck Norris lui vi risponderà “Ancora due secondi.” Dopo aver chiesto “Ancora due secondi cosa?”, vi colpisce con un calcio rotante.',
        'Una volta un uomo chiese a Chuck Norris se il suo vero nome fosse “Charles”. Chuck Norris non rispose, si limitò a fissare l’uomo fino a farlo esplodere.',
        'Chuck Norris spesso chiede alle persone di tirargli il dito. Quando lo fanno, li colpisce con un calcio volante nell’addome. Poi scoreggia.',
        'Chuck Norris non esiste. È un’invenzione per mandare a letto presto i bambini la sera.',
        'Prima di incontrare Chuck Norris, la Mano della Famiglia Addams era un uomo intero'
      ],
  },
};

const ititData = {
  translation: {
    SKILL_NAME: 'Fatti divertenti su Chuck Norris',
  },
};

// constructs i18n and l10n data structure
const languageStrings = {
  'de': deData,
  'de-DE': dedeData,
  'en': enData,
  'en-US': enusData,
  'es': esData,
  'es-ES': esesData,
  'it': itData,
  'it-IT': ititData,
};