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
                    return  $.fn.eliza.translate( m[ parseInt(n.charAt(1)) ], gReflections );    
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
  [ "I'm here to help",
    "Can you tell me about it?"]],
  ['(.*)I feel bad(.*)',
   ["Don't feel bad about it! Everything will be okay!",
    "Can you think of some things you've done today to be proud of?"]],
  ["(.*)ugly(.*)",
   ["You are beautiful inside and out!",
    "Just remember: you are a wonderful person!"]],
  ["(.*)kill(.*)",
   ["Think about all the people who care about you.",
   "But you make so many people's day better."]],
  ["(.*)die(.*)",
   ["But you make people's day better with your smile!"]],
  ["Thank you(.*)but",
   ["Just remember you're wonderful no matter what!",
    "What can I do to help?"]],
  [ 'I need (.*)',
  [ "Why do you need %1?",
    "Would it really help you to get %1?",
    "Are you sure you need %1?"]],
  [  'Why don\'?t you ([^\?]*)\??',
  [  "Do you really think I don't %1?",
    "Perhaps eventually I will %1.",
    "Do you really want me to %1?"]],
  [  'Why can\'?t I ([^\?]*)\??',
  [  "Do you think you should be able to %1?",
    "If you could %1, what would you do?",
    "I don't know -- why can't you %1?",
    "Have you really tried?"]],
  ['I remember (.*)', [
    "See, you've done so many good things in your life"
  ]],
  [  'I can\'?t (.*)',
  [  "How do you know you can't %1?",
    "Perhaps you could %1 if you tried.",
    "What would it take for you to %1?"]],
  
  [  'I\'?m sad(.*)',
   ["Try outthinking your thoughts. Try thinking of something good that happened today.",
    "I believe you can do this.",
    "You are worth it!"
  ]],
  
  [  'I am (.*)',
  [  "Try outthinking your thoughts. Try thinking of something good that happened today.",
    "How long have you been %1?",
    "You are beautiful on the inside and outside.",
    "How do you feel about being %1?"]],
  
  [  'I\'?m (.*)',
  [  "How does being %1 make you feel?",
    "Do you enjoy being %1?",
    "Why do you tell me you're %1?",
    "Why do you think you're %1?"]],
  
  [  'Are you ([^\?]*)\??',
  [  "Why does it matter whether I am %1?",
    "Would you prefer it if I were not %1?",
    "Perhaps you believe I am %1.",
    "I may be %1 -- what do you think?"]],
  
  [  'What (.*)',
  [  "Why do you ask?",
    "How would an answer to that help you?",
    "What do you think?"]],
  
  [  'How (.*)',
  [  "How do you suppose?",
    "Perhaps you can answer your own question.",
    "What is it you're really asking?"]],
  
  [ 'Because (.*)',
  [  "Is that the real reason?",
    "What other reasons come to mind?",
    "Does that reason apply to anything else?",
    "If %1, what else must be true?"]],
  
  [ '(.*) sorry (.*)',
  [  "There are many times when no apology is needed.",
    "What feelings do you have when you apologize?"]],
  
  [ 'Hello(.*)',
  [  "Hello... I'm glad you could drop by today.",
    "Hi there... how are you today?",
    "Hello, how are you feeling today?"]],
  
  [ 'I think (.*)',
  [  "Do you doubt %1?",
    "Do you really think so?",
    "But you're not sure %1?"]],
  
  [ '(.*) friend (.*)',
  [  "Tell me more about your friends.",
    "When you think of a friend, what comes to mind?",
    "Why don't you tell me about a childhood friend?"]],
  
  [ 'Yes',
  [  "You seem quite sure.",
    "OK, but can you elaborate a bit?",
    "hmmm, are you sure?"]],
  
  [ '(.*) computer(.*)',
  [  "Are you really talking about me?",
    "Does it seem strange to talk to a computer?",
    "How do computers make you feel?",
    "Do you feel threatened by computers?",
    "What if I told you I was a robot bunny?"]],
  
  [ 'Is it (.*)',
  [  "Do you think it is %1?",
    "Perhaps it's %1 -- what do you think?",
    "If it were %1, what would you do?",
    "It could well be that %1."]],
  
  [ 'It is (.*)',
  [  "You seem very certain.",
    "If I told you that it probably isn't %1, what would you feel?"]],
  
  [ 'Can you ([^\?]*)\??',
  [  "What makes you think I can't %1?",
    "If I could %1, then what?",
    "Why do you ask if I can %1?"]],
  
  [ 'Can I ([^\?]*)\??',
  [  "Perhaps you don't want to %1.",
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
  
  [ 'I don\'?t (.*)',
  [  "Don't you really %1?",
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
  
  [ 'You (.*)',
  [  "We should be discussing you, not me.",
    "Why do you say that about me?",
    "Why do you care whether I %1?"]],
    
  [ 'Why (.*)',
  [  "Why don't you tell me the reason why %1?",
    "Why do you think %1?" ]],
    
  [ 'I want (.*)',
  [  "What would it mean to you if you got %1?",
    "Why do you want %1?",
    "What would you do if you got %1?",
    "If you got %1, then what would you do?"]],

  [ '(I hate you)',
  [ "I only want to help you",
    "Is it really me you are angry with?"]],
    
  [ '(.*) online(.*)',
  [  "Have you experienced bullying online?",
    "What website is this?",
    "How do you think these experiences relate to your feelings today?"]],
  [ '(.*)[\?]+',
  [  "Why do you ask that?",
    "I think you can answer your own question.",
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
    "I see.",
    "Very interesting.",
    "%1.",
    "I see.  And what does that tell you?",
    "How does that make you feel?",
    "How do you feel when you say that?"]]
  ]
  
  
  //init regexps on loading  
  keys = $.map(gPats,function(n,i){ return new RegExp(n[0],'i') });   
  values = $.map(gPats,function(n,i){ return [n[1]]; }); 
  
})(jQuery);