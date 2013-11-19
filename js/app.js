/* global sharing */
var nouns = [],
    verbs = [];

Array.prototype.pick = function() {
  return this[Math.floor(Math.random()*this.length)];
};

function isBlacklisted(string) {
  for (var i=0;i<blacklist.length;i++) {
    if (string.toLowerCase().indexOf(blacklist[i]) >= 0) {
      return true;
    }
  }
  return false;
}

function generate(noun, verb) {
  noun = noun || nouns.pick().singularize();
  while (isBlacklisted(noun)) {
    noun = nouns.pick().singularize();
  }
  var f = noun.charAt(0);
  var vowel = false;
  if (f === 'a' || f === 'e' || f === 'i' || f ==='o' || f ==='u') {
    vowel = true;
  }
  $.ajax({
    url: 'http://api.wordnik.com/v4/word.json/'+noun+'/definitions?limit=200&includeRelated=true&useCanonical=false&includeTags=false&api_key='+key.API_KEY,
    async: false,
    dataType: 'json'
  }).done(function(result) {
    console.log(result);
    var def = result.pick().text;
    def = def.charAt(0).toLowerCase() + def.slice(1);
    var person = [
      'Girl',
      'Boy'
    ].pick()
    var a = 'a';
    if (vowel) { a = 'an'; }
    var generatedText = person + ', you must be ' + a + ' '  + noun + ' because you are ' + def;
    var sharedText = person + ', you must be ' + a + ' ' + noun + ' because you are ' + def;
    $('#content').html(generatedText);
    var shareUrl = window.location.href;
    $('#share').attr('href', shareUrl);
    $('.twitter-share-button').remove();
    $('#twitterShare').html('<a href="https://twitter.com/share" class="twitter-share-button" data-url="' + shareUrl + '" data-text="' + sharedText + '" data-lang="en">Tweet</a>');
    if (twttr.widgets) {
      twttr.widgets.load();
    }


  })
}

function getWords(suppressGenerate) {
  $.when(
    $.ajax({
      url: 'http://api.wordnik.com/v4/words.json/randomWords?minCorpusCount=10000&minDictionaryCount=5&excludePartOfSpeech=proper-noun,proper-noun-plural,proper-noun-posessive,suffix,family-name,idiom,affix&hasDictionaryDef=true&includePartOfSpeech=noun&limit=1000&maxLength=22&api_key='+key.API_KEY,
      async: false,
      dataType:'json'
    })
  ).done(function(noun_data) {
    nouns = $.map(noun_data, function(el) { return el.word; });
    if (!suppressGenerate) {
      generate();
    }
  });
}

$('#generate').click(function() { generate(); });
if (sharing.gup('word') === '') {
  getWords();
}
else {
  var verb = sharing.decodeStr(unescape(sharing.gup('word')).split('$')[0]);
  var noun = sharing.decodeStr(unescape(sharing.gup('word')).split('$')[1]);
  getWords(true);
  generate(noun, verb);
}
