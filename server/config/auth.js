// config/auth.js

// expose our config directly to our application using module.exports
module.exports = {

    // 'facebookAuth' : {
    //     'clientID'        : '1521987978118321', // your App ID
    //     'clientSecret'    : '8bb1c7151c2eca260100b842da38661d', // your App Secret
    //     'callbackURL'     : '/auth/facebook/callback'
    // },
// Tony's App
    'facebookAuth' : {
        'clientID'        : '544098965798466', // your App ID
        'clientSecret'    : '154206cc5cafc48b31469db647023de4', // your App Secret
        'callbackURL'     : '/auth/facebook/callback'
    },    

    'twitterAuth' : {
        'consumerKey'        : 'ZQ6MTNBjJHkO9xpvDarRGKLCu',
        'consumerSecret'     : 'ixGYky9wsgTsZ96b1NSxws0Daxscf5aVpqv9nzqjKLFmWzy6oG',
        'callbackURL'        : '/auth/twitter/callback'
    },

    'googleAuth' : {
        'clientID'         : '479400594225-ivt3k639uf1gdjd11f0vtbo1eumdnp59.apps.googleusercontent.com',
        'clientSecret'     : 'cf9dBHDeqWeG85v__cJMXXWZ',
        'callbackURL'      : 'http://smarter-experiences.de/oauth2callback'
    },

    'smtpConfig' : {
        'service'           :  'gmail',
        'username'          :  'smarterexperiences@gmail.com',
        'password'          :  'savetheplanet1',
        'fromId'            :  'smarterexperiences@gmail.com',
        'subject'           :  'Von Smarter Experiences',
        'textMessage'       :   '<p>sie wurden erfolgreich registriert.<br><br>Sie können sich jetzt einloggen, um das gewünschte Erlebnis zu bewerten.<br><br>Mit freundlichen Grüßen<br><br><br>Ihr Smarter Experience Team</p>',
        'passSubject'       :   'Passwort zurücksetzen bei Smarter Experiences'
    },
    'smtpConfig_addCompany' : {
        'service'           :  'gmail',
        'username'          :  'smarterexperiences@gmail.com',
        'password'          :  'savetheplanet1',
        'bcc'            :     'goekguel.ali@gmail.com',
        'subject'           :  'Ihr Angebot wurde hinzugefügt',
        'textMessage'       :   '<p>herzlichen Glückwunsch.<br><br>Ihr Angebot wird geprüft und wir werden uns bei ihnen schnellstmöglich melden.<br><br>Sie können anschließend ihr Produkt unter dem Tab ""Eigene"" bearbeiten.<br><br>Viele Grüße<br><br><br>Ihr Smarter Experience Team</p>',

    },
    'smtpConfig_addCompanyInfo' : {
        'service'           :  'gmail',
        'username'          :  'smarterexperiences@gmail.com',
        'password'          :  'savetheplanet1',
        'bcc'            :     'goekguel.ali@gmail.com',
        'subject'           :  'Ein Produkt wurde hinzugefügt',


    }
};
