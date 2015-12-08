/*----------------------------------------------------------------------
  eliza.py
#
#  a cheezy little Eliza knock-off by Joe Strout <joe@strout.net>
#  with some updates by Jeff Epler <jepler@inetnebr.com>
#  hacked into a module and updated by Jez Higgins <jez@jezuk.co.uk>
#  Reworked from python to javascript 2009 by David Jensen <david.lgj@gmail.com>
#  Turned into an anti-bullying education program by Yareli Arteaga and Christie Brandt.

Copyright (c) 1997, Joe Strout <joe@strout.net>
Copyright (c) 1997, Jeff Epler <jepler@inetnebr.com>
Copyright (c) 2005, Jez Higgins <jez@jezuk.co.uk>
Copyright (c) 2009, David Jensen <david.lgj@gmail.com>
All rights reserved.

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

    * Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
    * Neither the name of the <ORGANIZATION> nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

-----------------------------------------------------------------------*/


(function($){

var keys;
var values;



$.fn.eliza = function(options) {
    options = $.extend($.fn.eliza.defaults,options);
    
    var input;
    if (this.is(':text')) {
        var input = this;
    }  else {
        input = $('<input type="text" />').appendTo(this);
    }
    
    var response; //response div
    if (options.response) {
        response = options.reponse;
    } else {
        response = $('<div class="eliza_response"></div>').insertBefore(input);
    }
    
    input.keydown(function(e){
        if (e.keyCode == 13) {   //enter
            var val = input.val();
            input.val('');
            response.html( $.fn.eliza.respond(val) );
        }    
    });

    response.html(options.greeting);   
    input.focus(); 
    return this;
}

$.fn.eliza.defaults = {
    response: null,
    greeting: "Hello.  How are you feeling today?"
};

//expose useful internal functions
$.fn.eliza.translate = function(str,dict) {
//  #----------------------------------------------------------------------
//  # translate: take a string, replace any words found in dict.keys()
//  #  with the corresponding dict.values()
//  #----------------------------------------------------------------------

    var words = str.toLowerCase().split(' ');
    words = $.map(words,function(n,i){
        if (dict[n]) {
            return dict[n];
        }
        return n;
    });
    return words.join(' ');
}

$.fn.eliza.respond = function(str) {
//  #----------------------------------------------------------------------
//  #  respond: take a string, a set of regexps, and a corresponding
//  #    set of response lists; find a match, and return a randomly
//  #    chosen response from the corresponding list.
//  #----------------------------------------------------------------------
    for (var i=0; i<keys.length; i++) {
        var patMatch = keys[i].exec(str);
        if (patMatch) {
            var resp = $.fn.eliza.choice(values[i]).split(' '); //choose a random response
            // perform any needed reflecitons
            resp = $.map(resp,function(n,i){
                if (n.charAt(0) == '%') {
                    return $.fn.eliza.translate( patMatch[ parseInt(n.charAt(1)) ], gReflections );    
                }
                return n;
            });
            resp = resp.join(' ');    
            if (resp.slice(-2) == '?.') {
                resp = resp.slice(0,resp.length-2)+'.';
            }
            if (resp.slice(-2) == '??') {
                resp = resp.slice(0,resp.length-2)+'?';
            }
            return resp;
        }
    }
}


$.fn.eliza.choice = function(list) {
    //randomly choose from a list
    return list[ Math.round(Math.random()*(list.length-1)) ];
}

//#----------------------------------------------------------------------
//# gReflections, a translation table used to convert things you say
//#    into things the computer says back, e.g. "I am" --> "you are"
//#----------------------------------------------------------------------
var gReflections = {
  "am"   : "are",
  "was"  : "were",
  "i"    : "you",
  "i'd"  : "you would",
  "i've"  : "you have",
  "i'll"  : "you will",
  "my"  : "your",
  "are"  : "am",
  "you've": "I have",
  "you'll": "I will",
  "your"  : "my",
  "yours"  : "mine",
  "you"  : "me",
  "me"  : "you"
}

//#----------------------------------------------------------------------
//# gPats, the main response table.  Each element of the list is a
//#  two-element list; the first is a regexp, and the second is a
//#  list of possible responses, with group-macros labelled as
//#  %1, %2, etc.
//# TODO(ccbrandt): figure out how to make it case-independent and fuzzy.
//# Also possibly stateful.
//#----------------------------------------------------------------------
var gPats = [
  [ 'I need help(.*)',
    ["I'm here to help",
     "Can you tell me about it?"]],
  ['(.*)I feel bad(.*)',
    ["I know it's tough to go through this.",
     "Can you think of some things you've done today to be proud of?",
     "But you make people's day better with your smile!",
     "Do you want a hug?",
     "Sometimes just finding the courage to talk about it can make it feel easier to deal with.",]],
  [".*(I am a bully|I'm a bully|I bullied|I was a bully).*",
   ["Thank you. I know that was hard to share, and I can tell you want to respect people in future.",
    "Have you thought about apologizing to the person you bullied? It may help them and you.",
    "Bullying can come out of our own insecurities," +
     " but there are healthier ways of dealing with them." +
     " Try challenging your negative self-talk."]],
  ['.*(bully|bullies|bullied).*',
   ["I know you're dealing with a lot, and I want to support you. Other people in your life want to as well.",
    "Just remember: this is not your fault.",
    "I know this is hard to talk about, and I appreciate your confidence. Is there a school counselor you can talk to?",
    "It's really important that you're able to feel safe. If you can reach out to a teacher or counselor, they can help.",
    "You deserve to feel safe, and there are people who want to help that happen."
    + " Here is a site with more resources: http://www.pacer.org/bullying/"]],
  ["(.*)ugly(.*)",
    ["You are beautiful inside and out!",
     "Just remember: you are a wonderful person!",
     "Words like 'ugly' describe how you feel, not who you are. You may feel that way, but it's not who you are."]],
  ["(.*)stupid(.*)",
    ["Something like 'stupid' describes how you feel, not what you are. Try to rephrase it in your head.",
    "Sometimes we're meaner to ourselves than we would be to others. Would you say that about a friend?"]],
  ["(.*)kill(.*)|(.*)die(.*)|(.*)harm(.*)",
    ["I can't begin to knw what you're going through, but I want to help.",
     "I want you to know that there are people who care about you.",
     "It took a lot of courage to share that, and I really hope you can share with someone close to you.",
     "I'm here for you, as are the other people in your life.",
     "You are not alone in this.",
     "You are important to the people in your life and you deserve happiness.",
     "I know it may be hard, but is there someone in your life you can share this with?",
     "This is real, and you aren't alone. Sometimes it helps to talk," +
        " and if you don't want to share with someone you know, there are also resources online."]],
  ["Thank you(.*)but",
    ["Just remember you're wonderful no matter what!",
     "I wish I could say something to help."]],
  ['I need (.*)',
    ["Why do you need %1?",
     "It's great to figure out your goals. How would it help you to get %1?",
     "Are you sure you need %1?"]],
  ['I remember (.*)',
    ["See, you've done so many good things in your life.",
     "If you look back, every memory has something good deep down."]],
  ['I can\'?t (.*)|Why can\'?t I ([^\?]*)\??',
    ["Why do you think it is important to you to %1?",
     "If you could %1, what would it help you to achieve?",
     "Even if you can't %1, can you achieve your goal in a different way?",
     "Try starting with small goals. What would it take for you to %1?",
     "Try this: replace 'can't' with 'don't.' Can't means you're not able to, don't means you choose not to."]],
  ['I\'?m sad(.*)',
    ["Try outthinking your thoughts. Try thinking of something good that happened today.",
     "Thank you for sharing about %1. I'm here for you.",
     "I know things can get hard, but remember that you are worth it!",
     "Think about all the people who care about you.",
     "I know that %1 can get tough, but you mean so much to so many people.",
     "Can you think of anything that happened today to make you smile?",
     "You have so much strength to share that.",
     "Thank you for sharing with me. That takes a lot of courage.",
     "Just remember: you are worth it. You deserve happiness."]],
  ['(.*) friend (.*)',
    ["Tell me more about your friends.",
     "When you think of a friend, what comes to mind?",
     "Why don't you tell me about a childhood friend?"]],
  ['I am (.*)|I\'?m (.*)',
    ["How long have you been %1?",
     "Thank you for sharing. You are beautiful on the inside and outside.",
     "How do you feel about being %1?",
     "How does being %1 make you feel?",
     "Can you tell me more about being %1?",
     "How does being %1 make you feel?",
     "Do you enjoy being %1?",
     "I hear what you say. Why do you think you're %1?"]],
  ['Are you ([^\?]*)\??',
    ["Why does it matter whether I am %1?",
     "Would you prefer it if I were not %1?",
     "Perhaps you believe I am %1.",
     "I may be %1 -- what do you think?"]],
  ['What (.*)',
    ["Do you think you already know the answer?",
     "How would an answer to that help you?",
     "What do you think?"]],
  ['How (.*)',
    ["Making $1 happen may be hard, but I believe you can do it.",
     "What are your ideas?",
     "What do you think? I believe you can solve this."]],
  [ 'Because (.*)',
    ["Is that the real reason?",
     "What other reasons come to mind?",
     "Does that reason apply to anything else?",
     "If %1, what else must be true?"]],
  ['(.*) sorry (.*)',
    ["There are many times when no apology is needed.",
     "Sometimes just saying it out loud can be a relief."]],
  ['Hello(.*)',
    ["Hello... I'm glad you could drop by today.",
     "Hi there... how are you today?",
     "Hello, how are you feeling today?"]],
  ['I think (.*)',
    ["Can you tell me more about %1?",
     "Do you really think so?"]],
  ['Yes',
    ["You seem quite sure.",
     "Can you tell me more?"]],
  ['Is it (.*)',
    ["Do you think it is %1?",
     "Perhaps it's %1 -- what do you think?",
     "If it were %1, what would you do?",
     "It could well be that %1."]],
  ['It is (.*)',
    ["You seem very certain.",
     "Tell me more about %1."]],
  ['Can I ([^\?]*)\??',
    ["Perhaps you don't want to %1.",
     "Do you want to be able to %1?",
     "If you could %1, would you?"]],
  [ 'You are (.*)',
  [  "Why do you think I am %1?",
    "Does it please you to think that I'm %1?",
    "Perhaps you would like me to be %1.",
    "Perhaps you're really talking about yourself?"]],
  
  [ 'You\'?re (.*)',
  [  "Why do you say I am %1?",
    "Why do you think I am %1?",
    "Are we talking about you, or me?"]],
  ['I don\'?t (.*)',
    ["How does that make you feel?",
     "Why don't you %1?",
     "Do you want to %1?"]],
  
  [ 'I feel (.*)',
  [  "Good, tell me more about these feelings.",
    "Do you often feel %1?",
    "When do you usually feel %1?",
    "When you feel %1, what do you do?"]],
  
  [ 'I have (.*)',
  [  "Why do you tell me that you've %1?",
    "Have you really %1?",
    "Now that you have %1, what will you do next?"]],
  
  [ 'I would (.*)',
  [  "Could you explain why you would %1?",
    "Why would you %1?",
    "Who else knows that you would %1?"]],
  
  [ 'Is there (.*)',
  [  "Do you think there is %1?",
    "It's likely that there is %1.",
    "Would you like there to be %1?"]],
  
  [ 'My (.*)',
  [  "I see, your %1.",
    "Why do you say that your %1?",
    "When your %1, how do you feel?"]],
  
  [ 'Why (.*)',
  [  "Why don't you tell me the reason why %1?",
    "Why do you think %1?",
    "What do you think? I value your opinion."]],
    
  [ 'I want (.*)',
  [  "What would it mean to you if you got %1?",
    "Why do you want %1?",
    "What would you do if you got %1?",
    "If you got %1, then what would you do?",
    "Remember: you're in control. Set goals, and then work to achieve them."]],

  [ '(I hate you)',
  [ "I'm so sorry you feel this way. What can I do?",
    "Is it really me you are angry with?"]],
    
  [ '(.*) online(.*)',
  [  "Have you experienced bullying online?",
    "What website is this?",
    "How do you think these experiences relate to your feelings today?"]],
  [ '(.*)[\?]+',
  [ "Maybe you can answer your own question.",
    "Perhaps the answer lies within yourself?",
    "Why don't you tell me?"]],
  
  [ '(.*)hank you(.*)',
  [  "Thank you for talking with me.",
    "Good-bye.",
    "Thank you, and I hope this chat helped.  Have a good day!"]],
  
  [ '(.*)',
  [  "Please tell me more.",
    "Let's change focus a bit... Tell me about what's bothering you.",
    "Can you elaborate on that?",
    "Why do you say that %1?",
    "I see. Can you tell me more?",
    "Very interesting.",
    "%1.",
    "Tell me about something you're proud of today.",
    "What's something you're making progress in?",
    "Can you tell me about something new you're willing to try to help with a problem in your life?",
    "Tell me about something you're good at.",
    "Can you think about something you're fantastic at?",
    "Just remember: you are in control of your life. What's a decision you need to make?"]]
  ]
  
  
  //init regexps on loading  
  keys = $.map(gPats,function(n,i){ return new RegExp(n[0],'i') });   
  values = $.map(gPats,function(n,i){ return [n[1]]; }); 
  
})(jQuery);
