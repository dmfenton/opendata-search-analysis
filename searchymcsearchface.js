(function(global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined'
    ? (module.exports = factory())
    : typeof define === 'function' && define.amd ? define('searchymcsearchface', factory) : (global.searchymcsearchface = factory());
})(this, function() {
  'use strict';
  var step2list = {
    ational: 'ate',
    tional: 'tion',
    enci: 'ence',
    anci: 'ance',
    izer: 'ize',
    bli: 'ble',
    alli: 'al',
    entli: 'ent',
    eli: 'e',
    ousli: 'ous',
    ization: 'ize',
    ation: 'ate',
    ator: 'ate',
    alism: 'al',
    iveness: 'ive',
    fulness: 'ful',
    ousness: 'ous',
    aliti: 'al',
    iviti: 'ive',
    biliti: 'ble',
    logi: 'log'
  };

  var step3list = {
    icate: 'ic',
    ative: '',
    alize: 'al',
    iciti: 'ic',
    ical: 'ic',
    ful: '',
    ness: ''
  };

  // Porter stemmer in Javascript. Few comments, but it's easy to follow against
  // the rules in the original paper, in
  //
  //  Porter, 1980, An algorithm for suffix stripping, Program, Vol. 14, no. 3,
  //  pp 130-137,
  //
  // see also http://www.tartarus.org/~martin/PorterStemmer

  // Release 1 be 'andargor', Jul 2004
  // Release 2 (substantially revised) by Christopher McKenzie, Aug 2009

  var memo = {};

  var c = '[^aeiou]'; // consonant
  var v = '[aeiouy]'; // vowel
  var C = c + '[^aeiouy]*'; // consonant sequence
  var V = v + '[aeiou]*'; // vowel sequence

  var mgr0 = '^(' + C + ')?' + V + C; // [C]VC... is m>0
  var meq1 = '^(' + C + ')?' + V + C + '(' + V + ')?$'; // [C]VC[V] is m=1
  var mgr1 = '^(' + C + ')?' + V + C + V + C; // [C]VCVC... is m>1
  var sV = '^(' + C + ')?' + v; // vowel in stem esling-ignore-line

  function memoizingStemmer(w) {
    if (!memo[w]) {
      memo[w] = stemmer(w);
    }
    return memo[w];
  }

  function stemmer(w) {
    var stem = void 0;
    var suffix = void 0;
    var firstch = void 0;
    var re = void 0;
    var re2 = void 0;
    var re3 = void 0;
    var re4 = void 0;
    var fp = void 0;

    if (w.length < 3) {
      return w;
    }

    firstch = w.substr(0, 1);
    if (firstch === 'y') {
      w = firstch.toUpperCase() + w.substr(1);
    }

    // Step 1a
    re = /^(.+?)(ss|i)es$/;
    re2 = /^(.+?)([^s])s$/;

    if (re.test(w)) {
      w = w.replace(re, '$1$2');
    } else if (re2.test(w)) {
      w = w.replace(re2, '$1$2');
    }

    // Step 1b
    re = /^(.+?)eed$/;
    re2 = /^(.+?)(ed|ing)$/;
    if (re.test(w)) {
      fp = re.exec(w);
      re = new RegExp(mgr0);
      if (re.test(fp[1])) {
        re = /.$/;
        w = w.replace(re, '');
      }
    } else if (re2.test(w)) {
      fp = re2.exec(w);
      stem = fp[1];
      re2 = new RegExp(sV);
      if (re2.test(stem)) {
        w = stem;
        re2 = /(at|bl|iz)$/;
        re3 = new RegExp('([^aeiouylsz])\\1$');
        re4 = new RegExp('^' + C + v + '[^aeiouwxy]$');
        if (re2.test(w)) {
          w = w + 'e';
        } else if (re3.test(w)) {
          re = /.$/;
          w = w.replace(re, '');
        } else if (re4.test(w)) {
          w = w + 'e';
        }
      }
    }

    // Step 1c
    re = /^(.+?)y$/;
    if (re.test(w)) {
      fp = re.exec(w);
      stem = fp[1];
      re = new RegExp(sV);
      if (re.test(stem)) {
        w = stem + 'i';
      }
    }

    // Step 2
    re = /^(.+?)(ational|tional|enci|anci|izer|bli|alli|entli|eli|ousli|ization|ation|ator|alism|iveness|fulness|ousness|aliti|iviti|biliti|logi)$/;
    if (re.test(w)) {
      fp = re.exec(w);
      stem = fp[1];
      suffix = fp[2];
      re = new RegExp(mgr0);
      if (re.test(stem)) {
        w = stem + step2list[suffix];
      }
    }

    // Step 3
    re = /^(.+?)(icate|ative|alize|iciti|ical|ful|ness)$/;
    if (re.test(w)) {
      fp = re.exec(w);
      stem = fp[1];
      suffix = fp[2];
      re = new RegExp(mgr0);
      if (re.test(stem)) {
        w = stem + step3list[suffix];
      }
    }

    // Step 4
    re = /^(.+?)(al|ance|ence|er|ic|able|ible|ant|ement|ment|ent|ou|ism|ate|iti|ous|ive|ize)$/;
    re2 = /^(.+?)(s|t)(ion)$/;
    if (re.test(w)) {
      fp = re.exec(w);
      stem = fp[1];
      re = new RegExp(mgr1);
      if (re.test(stem)) {
        w = stem;
      }
    } else if (re2.test(w)) {
      fp = re2.exec(w);
      stem = fp[1] + fp[2];
      re2 = new RegExp(mgr1);
      if (re2.test(stem)) {
        w = stem;
      }
    }

    // Step 5
    re = /^(.+?)e$/;
    if (re.test(w)) {
      fp = re.exec(w);
      stem = fp[1];
      re = new RegExp(mgr1);
      re2 = new RegExp(meq1);
      re3 = new RegExp('^' + C + v + '[^aeiouwxy]$');
      if (re.test(stem) || (re2.test(stem) && !re3.test(stem))) {
        w = stem;
      }
    }

    re = /ll$/;
    re2 = new RegExp(mgr1);
    if (re.test(w) && re2.test(w)) {
      re = /.$/;
      w = w.replace(re, '');
    }

    // and turn initial Y back to y

    if (firstch === 'y') {
      w = firstch.toLowerCase() + w.substr(1);
    }

    return w;
  }

  var languages = {
    en: {
      stopWords: {
        tags: ['city', 'county', 'country', 'town', 'shire', 'park', ':', '^', 'information', 'month', 'year', 'week', 'day'],
        time: ['created', 'modified', 'yesterday', 'today', 'month', 'year', 'last', 'week'],
        geo: [
          '*',
          'popular',
          'documents',
          'document',
          'related',
          'published',
          'created',
          'modified',
          'month',
          'week',
          'year',
          'latest',
          'newest',
          'yesterday',
          'explorer',
          'feature',
          'features',
          'pdf',
          'jpg',
          'jpeg',
          'city engine',
          'group',
          'sharing',
          'user',
          'catalog',
          'cityengine',
          'scene',
          'sample',
          'ogc',
          'arcmap',
          'arcgis',
          'mxd',
          'data',
          'place',
          'template',
          'maps',
          'mapservices',
          'mapservice',
          'shapefile',
          'shp',
          'type',
          'webmap',
          'shp',
          'kml',
          'lyr',
          'layer',
          'zip',
          'code',
          'app',
          'apps',
          'test',
          'application',
          'service',
          'services',
          'tile',
          'tiles',
          'file',
          'files',
          'definition',
          'globe',
          'gp',
          'geoprocess',
          'geoprocessing',
          'image',
          'geometry',
          'geodata',
          'network',
          'analysis',
          'dashboard',
          'addin',
          'sd',
          'tpk',
          'wms',
          'doc',
          'docx',
          'ppt',
          'pptx',
          'lpk',
          'gpk',
          'javascript',
          'java',
          'python',
          'arcpy',
          'flex',
          'viewer',
          'operation',
          'web',
          'mapping',
          'attachment',
          'symbol',
          'window',
          'linux',
          'os',
          'color',
          'silverlight',
          'microsoft',
          'google',
          'collection',
          'download'
        ],
        dict: [
          '@',
          '#',
          'a',
          "a's",
          'able',
          'about',
          'above',
          'according',
          'accordingly',
          'across',
          'actually',
          'after',
          'afterwards',
          'again',
          'against',
          "ain't",
          'all',
          'allow',
          'allows',
          'almost',
          'alone',
          'along',
          'already',
          'also',
          'although',
          'always',
          'am',
          'among',
          'amongst',
          'an',
          'and',
          'another',
          'any',
          'anybody',
          'anyhow',
          'anyone',
          'anything',
          'anyway',
          'anyways',
          'anywhere',
          'apart',
          'appear',
          'appreciate',
          'appropriate',
          'are',
          "aren't",
          'around',
          'as',
          'aside',
          'ask',
          'asking',
          'associated',
          'at',
          'available',
          'away',
          'awfully',
          'b',
          'be',
          'became',
          'because',
          'become',
          'becomes',
          'becoming',
          'been',
          'before',
          'beforehand',
          'behind',
          'being',
          'believe',
          'below',
          'beside',
          'besides',
          'best',
          'better',
          'between',
          'beyond',
          'both',
          'brief',
          'but',
          'by',
          'c',
          "c'mon",
          "c's",
          'came',
          'can',
          "can't",
          'cannot',
          'cant',
          'cause',
          'causes',
          'certain',
          'certainly',
          'changes',
          'clearly',
          'co',
          'com',
          'come',
          'comes',
          'concerning',
          'consequently',
          'consider',
          'considering',
          'contain',
          'containing',
          'contains',
          'corresponding',
          'could',
          "couldn't",
          'course',
          'currently',
          'd',
          'definitely',
          'described',
          'despite',
          'did',
          "didn't",
          'different',
          'do',
          'does',
          "doesn't",
          'doing',
          "don't",
          'done',
          'down',
          'downwards',
          'during',
          'e',
          'each',
          'edu',
          'eg',
          'eight',
          'either',
          'else',
          'elsewhere',
          'enough',
          'entirely',
          'especially',
          'et',
          'etc',
          'even',
          'ever',
          'every',
          'everybody',
          'everyone',
          'everything',
          'everywhere',
          'ex',
          'exactly',
          'example',
          'except',
          'f',
          'far',
          'few',
          'fifth',
          'find',
          'finding',
          'first',
          'five',
          'followed',
          'following',
          'follows',
          'for',
          'former',
          'formerly',
          'forth',
          'four',
          'from',
          'further',
          'furthermore',
          'g',
          'get',
          'gets',
          'getting',
          'given',
          'gives',
          'go',
          'goes',
          'going',
          'gone',
          'got',
          'gotten',
          'greetings',
          'h',
          'had',
          "hadn't",
          'happens',
          'hardly',
          'has',
          "hasn't",
          'have',
          "haven't",
          'having',
          'he',
          "he's",
          'hello',
          'help',
          'hence',
          'her',
          'here',
          "here's",
          'hereafter',
          'hereby',
          'herein',
          'hereupon',
          'hers',
          'herself',
          'hi',
          'him',
          'himself',
          'his',
          'hither',
          'hopefully',
          'how',
          'howbeit',
          'however',
          'i',
          "i'd",
          "i'll",
          "i'm",
          "i've",
          'ie',
          'if',
          'ignored',
          'immediate',
          'in',
          'inasmuch',
          'inc',
          'indeed',
          'indicate',
          'indicated',
          'indicates',
          'inner',
          'insofar',
          'instead',
          'into',
          'inward',
          'is',
          "isn't",
          'it',
          "it'd",
          "it'll",
          "it's",
          'its',
          'itself',
          'j',
          'just',
          'k',
          'keep',
          'keeps',
          'kept',
          'know',
          'knows',
          'known',
          'l',
          'last',
          'lately',
          'later',
          'latter',
          'latterly',
          'least',
          'less',
          'lest',
          'let',
          "let's",
          'like',
          'liked',
          'likely',
          'little',
          'look',
          'looking',
          'looks',
          'ltd',
          'm',
          'made',
          'mainly',
          'many',
          'may',
          'maybe',
          'me',
          'mean',
          'meanwhile',
          'merely',
          'might',
          'more',
          'moreover',
          'most',
          'mostly',
          'much',
          'must',
          'my',
          'myself',
          'n',
          'name',
          'namely',
          'nd',
          'near',
          'nearly',
          'necessary',
          'need',
          'needs',
          'neither',
          'never',
          'nevertheless',
          // "new",
          'next',
          'nine',
          'no',
          'nobody',
          'non',
          'none',
          'noone',
          'nor',
          'normally',
          'not',
          'nothing',
          'novel',
          'now',
          'nowhere',
          'o',
          'obviously',
          'of',
          'off',
          'often',
          'oh',
          'ok',
          'okay',
          'old',
          'on',
          'once',
          'one',
          'ones',
          'only',
          'onto',
          'or',
          'other',
          'others',
          'otherwise',
          'ought',
          'our',
          'ours',
          'ourselves',
          'out',
          'outside',
          'over',
          'overall',
          'own',
          'p',
          'particular',
          'particularly',
          'per',
          'perhaps',
          'placed',
          'please',
          'plus',
          'possible',
          'presumably',
          'probably',
          'provides',
          'q',
          'que',
          'quite',
          'qv',
          'r',
          'rather',
          'rd',
          're',
          'really',
          'reasonably',
          'regarding',
          'regardless',
          'regards',
          'relatively',
          'respectively',
          'right',
          's',
          'said',
          'same',
          'saw',
          'say',
          'saying',
          'says',
          'second',
          'secondly',
          'see',
          'seeing',
          'seem',
          'seemed',
          'seeming',
          'seems',
          'seen',
          'self',
          'selves',
          'sensible',
          'sent',
          'serious',
          'seriously',
          'seven',
          'several',
          'shall',
          'she',
          'should',
          "shouldn't",
          'show',
          'since',
          'six',
          'so',
          'some',
          'somebody',
          'somehow',
          'someone',
          'something',
          'sometime',
          'sometimes',
          'somewhat',
          'somewhere',
          'soon',
          'sorry',
          'specified',
          'specify',
          'specifying',
          'still',
          'sub',
          'such',
          'sup',
          'sure',
          't',
          "t's",
          'take',
          'taken',
          'tell',
          'tends',
          'th',
          'than',
          'thank',
          'thanks',
          'thanx',
          'that',
          "that's",
          'thats',
          'the',
          'their',
          'theirs',
          'them',
          'themselves',
          'then',
          'thence',
          'there',
          "there's",
          'thereafter',
          'thereby',
          'therefore',
          'therein',
          'theres',
          'thereupon',
          'these',
          'they',
          "they'd",
          "they'll",
          "they're",
          "they've",
          'think',
          'third',
          'this',
          'thorough',
          'thoroughly',
          'those',
          'though',
          'three',
          'through',
          'throughout',
          'thru',
          'thus',
          'to',
          'together',
          'too',
          'took',
          'toward',
          'towards',
          'tried',
          'tries',
          'truly',
          'try',
          'trying',
          'twice',
          'two',
          'u',
          'un',
          'under',
          'unfortunately',
          'unless',
          'unlikely',
          'until',
          'unto',
          'up',
          'upon',
          'us',
          'use',
          'used',
          'useful',
          'uses',
          'using',
          'usually',
          'uucp',
          'v',
          'value',
          'various',
          'very',
          'via',
          'viz',
          'vs',
          'w',
          'want',
          'wants',
          'was',
          "wasn't",
          'way',
          'we',
          "we'd",
          "we'll",
          "we're",
          "we've",
          'welcome',
          'well',
          'went',
          'were',
          "weren't",
          'what',
          "what's",
          'whatever',
          'when',
          'whence',
          'whenever',
          'where',
          "where's",
          'whereafter',
          'whereas',
          'whereby',
          'wherein',
          'whereupon',
          'wherever',
          'whether',
          'which',
          'while',
          'whither',
          'who',
          "who's",
          'whoever',
          'whole',
          'whom',
          'whose',
          'why',
          'will',
          'willing',
          'wish',
          'with',
          'within',
          'without',
          "won't",
          'wonder',
          'would',
          'would',
          "wouldn't",
          'x',
          'y',
          'yes',
          'yet',
          'you',
          "you'd",
          "you'll",
          "you're",
          "you've",
          'your',
          'yours',
          'yourself',
          'yourselves',
          'z',
          'zero'
        ]
      },
      keywords: {
        map: 'map',
        maps: 'maps',
        webmap: 'webmap',
        webmaps: 'webmaps',
        basemap: 'basemap',
        basemaps: 'basemaps',
        presentation: 'presentation',
        presentations: 'presentations',
        webapp: 'webapp',
        webapps: 'webapps',
        app: 'app',
        apps: 'apps',
        mobile: 'mobile',
        code: 'code',
        cityengine: 'cityengine',
        webscene: 'webscene',
        '3d': '3d',
        globe: 'globe',
        templates: 'templates',
        tpk: 'tpk',
        lyr: 'lyr',
        layer: 'layer',
        tiles: 'tiles',
        data: 'data',
        image: 'image',
        pptx: 'pptx',
        document: 'document',
        documents: 'documents',
        mapservice: 'mapservice',
        mapservices: 'mapservices',
        feature: 'feature',
        features: 'features',
        featureservice: 'feature service',
        featureservices: 'features ervices',
        service: 'service',
        services: 'services',
        imagery: 'imagery',

        popular: 'popular',
        oldest: 'oldest',

        lastyear: 'last year',
        lastmonth: 'last month',
        week: 'week',
        month: 'month',
        year: 'year',
        today: 'today',
        latest: 'latest',
        yesterday: 'yesterday',
        in: 'in',
        at: 'at'
      }
    },
    zh: {
      stopwords: {
        tags: ['城市', '郡', '县', '省', '市', '国家', '城镇', '镇', '村', '村落', '乡村', '公园', '信息', '资讯', '月', '年', '周', '星期', '天', '季度'],
        time: ['创建', '编辑', '调整', '改变', '昨天', '今天', '月', '年', '上', '周', '星期'],
        geo: [
          '受欢迎',
          '流行',
          '文档',
          '文本',
          '相关',
          '发布',
          '创建',
          '编辑',
          '月',
          '周',
          '星期',
          '年',
          '最近',
          '最新',
          '昨天',
          '探索',
          '要素',
          '特征',
          '城市引擎',
          '组',
          '分享',
          '用户',
          '目录',
          '场景',
          '样本',
          '数据',
          '地点',
          '地方',
          '模板',
          '地图',
          '地图服务',
          '类型',
          '种类',
          '网页地图',
          '网络地图',
          '图层',
          '压缩文件',
          '压缩包',
          '代码',
          '软件',
          '应用',
          '测试',
          '服务',
          '图块',
          '地图图块',
          '文件',
          '定义',
          '地球',
          '地理处理',
          '图片',
          '图像',
          '几何',
          '地理数据',
          '网络',
          '分析',
          '仪表盘',
          '仪表板',
          '插件',
          '图块包',
          '地图图块包',
          '幻灯片',
          '图层包',
          '浏览器',
          '操作',
          '运行',
          '网',
          '绘图',
          '制图',
          '附件',
          '符号',
          '窗口',
          '操作系统',
          '颜色',
          '微软',
          '谷歌',
          '搜集',
          '收集',
          '集合',
          '下载'
        ],
        dict: [
          '找',
          '想',
          '要',
          '需',
          '的',
          '关',
          '一',
          '不',
          '在',
          '人',
          '有',
          '是',
          '为',
          '以',
          '于',
          '上',
          '他',
          '而',
          '后',
          '之',
          '来',
          '及',
          '了',
          '因',
          '下',
          '可',
          '到',
          '由',
          '这',
          '与',
          '也',
          '此',
          '但',
          '并',
          '个',
          '其',
          '已',
          '无',
          '小',
          '我',
          '们',
          '起',
          '最',
          '再',
          '今',
          '去',
          '好',
          '只',
          '又',
          '或',
          '很',
          '亦',
          '某',
          '把',
          '那',
          '你',
          '乃',
          '它',
          '吧',
          '被',
          '比',
          '别',
          '趁',
          '当',
          '从',
          '到',
          '得',
          '打',
          '凡',
          '儿',
          '尔',
          '该',
          '各',
          '给',
          '跟',
          '和',
          '何',
          '还',
          '即',
          '几',
          '既',
          '看',
          '据',
          '数',
          '距',
          '靠',
          '啦',
          '了',
          '另',
          '么',
          '每',
          '们',
          '嘛',
          '拿',
          '哪',
          '那',
          '您',
          '凭',
          '且',
          '却',
          '让',
          '仍',
          '啥',
          '如',
          '若',
          '使',
          '谁',
          '虽',
          '随',
          '同',
          '所',
          '她',
          '哇',
          '嗡',
          '往',
          '哪',
          '些',
          '向',
          '沿',
          '哟',
          '用',
          '于',
          '咱',
          '则',
          '怎',
          '曾',
          '至',
          '致',
          '着',
          '诸',
          '自'
        ]
      },
      keywords: {
        map: 'map',
        maps: '地图',
        webmap: '网络地图',
        webmaps: 'webmaps',
        basemap: '网页地图',
        basemaps: '底图',
        presentation: '展示',
        presentations: '展示',
        webapp: 'webapp',
        webapps: 'webapps',
        app: '软件',
        apps: '网页软件',
        mobile: '移动',
        code: '代码',
        cityengine: '城市引擎',
        webscene: '三维',
        '3d': '3维',
        globe: '地球',
        templates: '模板',
        tpk: '地图图块包',
        lyr: 'lyr',
        layer: '图层',
        tiles: '地图图块',
        data: '数据',
        image: '图像',
        images: '图片',
        pptx: '幻灯片',
        document: '文档',
        documents: '文本',
        mapservice: 'mapservice',
        mapservices: '地图服务',
        feature: '特征',
        features: '特征',
        featureservice: '要素服务',
        featureservices: '特征服务',
        service: 'service',
        services: '服务',
        imagery: '影像',
        popular: '最受欢迎',
        oldest: '最老',

        lastyear: '去年',
        lastmonth: '上个月',
        week: '周',
        month: '月',
        year: '年',
        today: '今天',
        latest: '最近的',
        yesterday: '昨天',
        in: '在',
        at: '的'
      }
    }
  };

  function parse(query) {
    var lang = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'en';

    var user = void 0;
    var newQuery = void 0;
    // get usernames first since its case sensitive
    if (query.match(/@[a-zA-Z0-9_-]+/)) {
      user = query.match(/@[a-zA-Z0-9_-]+/g)[0];
      newQuery = query.replace(user, '');
      user = user.replace('@', '');
    } else if (query.match(/\b(by esri|from esri)\b/gi)) {
      user = query.match(/\b(by esri|from esri)\b/gi)[0];
      newQuery = query.replace(user, '');
      user = '(esri OR AtlasPublisher OR esri_atlas esri_en OR Esri_content OR EsriMedia OR StoryMaps)';
    }
    if (user) {
      return {
        intent: {
          user: user
        },
        newQuery: newQuery
      };
    }
  }

  parse.caseSensitive = true;

  var en = {
    default: {
      type: 'Web Map,Web Mapping Application,Feature Service,Map Service,Image Service,Code Sample,CityEngine Web Scene',
      keywords: 'Online Map,Data',
      sort: 'desc',
      negativeTags: 'basemap'
    },
    // GIS Stuff
    webmaps: {
      type: 'Web Map',
      keywords: 'Web Map,Online Map,Map,ArcGIS Online',
      negativeKeywords: 'web mapping application',
      negativeTags: 'basemap'
    },
    basemaps: {
      type: 'Map Service, tiles'
    },
    presentations: {
      type: 'Web Map',
      keywords: 'Presentation Map'
    },
    apps: {
      type: 'Web Mapping Application,Application,Mobile Application,Code Sample'
    },
    mobile: {
      type: 'Mobile Application'
    },
    code: {
      type: 'Code Sample'
    },
    globe: {
      type: 'CityEngine Web Scene,Globe Service'
    },
    templates: {
      type: 'Web Mapping Application,Map Template,Feature Collection Template,Desktop Application Template'
    },
    tpk: {
      type: 'Tile Package'
    },
    layer: {
      type: 'Layer, Layer Package'
    },
    shp: {
      type: 'Shapefile'
    },
    csv: {
      type: 'CSV'
    },
    kmz: {
      type: 'KML',
      keywords: 'kml,kmz,Map,Data'
    },
    sd: {
      type: 'Service Definition'
    },
    fgdb: {
      type: 'File Geodatabase'
    },
    wms: {
      type: 'WMS',
      keywords: 'OGC'
    },
    tiles: {
      type: 'Map Service',
      kewords: 'Hosted'
    },
    data: {
      type: 'Feature Collection,KML,CSV,Shapefile,Feature Service',
      keywords: 'Data'
    },
    // Documents
    // jpg, jpeg, images, doc, ppt, document
    image: {
      type: 'Image'
    },
    docx: {
      type: 'Microsoft Word',
      keywords: 'Document'
    },
    pptx: {
      type: 'Microsoft Powerpoint',
      keywords: 'Document'
    },
    pdf: {
      type: 'PDF',
      keywords: 'Document'
    },
    documents: {
      type: 'Document'
    },
    mxd: {
      type: 'Map Document',
      keyword: 'Document'
    },
    // Services
    // 'mapservice', 'featureservice', 'service'
    mapservices: {
      type: 'Map Service'
    },
    features: {
      type: 'Feature Collection,Feature Service,Shapefile'
    },
    featureservies: {
      type: 'Feature Serviec',
      keywords: 'service'
    },
    services: {
      type: 'Map Service,Image Service,Feature Service',
      keywods: 'service'
    },
    imagery: {
      type: 'Image Service',
      keywords: 'service'
    },
    // Anything
    everything: {
      type: 'Web Map,Web Mapping Application,Map Service, Image Service, Feature Service, KML, CSV, Shapefile, Code Sample',
      keywords: 'Document, Online Map, Web Map, Data, Hosted',
      sort: 'desc',
      negativeTags: 'basemap'
    }
  };

  var parseType = function(query) {
    var lang = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'en';

    var newQuery = void 0;
    var type =
      query.match(
        /\b(\*|everything|anything|data|features|web[ ]?scene|3d|globe|imagery|images|image|mobile|city[ ]?engine|jpeg|jpg|ppt[x]?|shp|csv|kml|kmz|code|zip|shp|shapefile|lyr|layers|templates|document[s]?|webapp[s]?|app[s]?|webmap[s]?|presentation[s]?|basemap[s]?|map[s]?|mapservice[s]?|feature[ ]?service[s]?|service[s]?|tiles|tpk|pdf|doc|docx|wms|ogc|sd|mxd)\b/g
      ) || '';
    if (type) newQuery = query.replace(type, '');
    else newQuery = query;
    type = type.toString().replace(' ', '');
    var intent = en[type] || en.default;
    return {
      intent: intent,
      newQuery: newQuery
    };
  };

  var parseLocation = function(query) {
    var lang = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'en';
    var stopWords = languages[lang].stopWords;

    var location = void 0;
    // let newQuery
    var preceeding = void 0;
    if (query.match(/\sin\s/)) {
      if (query.split(/\sin\s/).length > 1) {
        var inArr = query.split(
          /\sin\s/
          // newQuery = inArr.slice(0, 1).join()
        );
        preceeding = 'in';
        location = inArr.slice(1, inArr.length).join(' ');
      }
    } else if (query.match(/\sat\s/)) {
      if (query.split(/\sat\s/).length > 1) {
        var _inArr = query.split(
          /\sat\s/
          // newQuery = inArr.slice(0, 1).join()
        );
        preceeding = 'at';
        location = _inArr.slice(1, _inArr.length).join(' ');
      }
    }

    if (!location) return;
    var wordlist = location.split(/\s/);
    var newLocationArray = [];

    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (
        var _iterator = wordlist[Symbol.iterator](), _step;
        !(_iteratorNormalCompletion = (_step = _iterator.next()).done);
        _iteratorNormalCompletion = true
      ) {
        var word = _step.value;

        if (stopWords.dict.indexOf(word) < 0 && stopWords.geo.indexOf(word) < 0) {
          newLocationArray.push(word);
        }
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }

    location = newLocationArray.join(' ');

    return {
      tagSearch: newLocationArray,
      intent: {
        location: location
      },
      newQuery: query.replace(' ' + preceeding + ' ' + location, '')
    };
  };

  var regexes = {
    en: {
      typeRegx:
        '\\b(\\*|everything|anything|data|features|web[ ]?scene|3d|globe|imagery|images|image|mobile|city[ ]?engine|jpeg|jpg|ppt[x]?|shp|csv|kml|kmz|code|zip|shp|shapefile|lyr|layers|templates|document[s]?|webapp[s]?|app[s]?|webmap[s]?|presentation[s]?|basemap[s]?|map[s]?|mapservice[s]?|feature[ ]?service[s]?|service[s]?|tiles|tpk|pdf|doc|docx|wms|ogc|sd|mxd)\\b',

      tagRegx: '#[a-zA-Z0-9_-]+',
      popular: '\\b(popular)\\b',
      oldest: '\\b(oldest)\\b',

      intentTimeRegx: '\\b(last month|last year|year|week|month|today|yesterday|latest)\\b',
      inmeta: '\\sin\\s',
      at: '\\sat\\s'
    },

    zh: {
      typeRegx:
        '(数据|特征|要素|3维|三维|三d|地球|影像|图像|图片|手机|移动|城市引擎|幻灯片|代码|压缩包|压缩文件|图层|模板|文本|文档|软件|网页|网页软件|网络地图|网页地图|展示|底图|地图|地图服务|特征服务|要素服务|服务|图块|地图图块|图块包|地图图块包)[数据]?',

      tagRegx: '#W+',
      popular: '最受欢迎[的]?',
      oldest: '最老[的]?',

      intentTimeRegx: '(上个月|去年|年|周|月|今天|昨天|最近的)',
      inmeta: '在.+的',
      at: '\\sat\\s'
    }
  };

  var parseOldest = function(query) {
    var lang = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'en';
    var keyWords = languages[lang].keyWords;

    var re = new RegExp(regexes[lang].oldest, 'gi');
    if (query.match(re)) {
      return {
        intent: {
          sort: 'asc',
          sortField: 'modified',
          duration: 'oldest'
        },
        newQuery: query.replace(keyWords['oldest'], '')
      };
    }
  };

  var thisDate = new Date();
  var thisYear = thisDate.getFullYear();
  var thisMonth = thisDate.getMonth();
  var thisDay = thisDate.getDay();

  var mappings = {
    default: {},
    'last year': {
      duration: 'last year',
      sort: 'asc',
      from: new Date(thisYear - 1, 0, 1),
      to: new Date(thisYear - 1, 11, 31, 23, 59, 59)
    },
    'last month': {
      duration: 'last month',
      sort: 'asc',
      from: new Date(thisYear, thisMonth - 1),
      to: new Date(thisYear, thisMonth, 1, 0, 0, 0)
    },
    'last week': {
      duration: 'week ago',
      sort: 'asc',
      from: new Date(thisDate.getTime() - 7 * 24 * 60 * 60 * 1000),
      to: new Date()
    },
    week: {
      duration: 'week ago',
      sort: 'asc',
      from: new Date(thisDate.getTime() - 7 * 24 * 60 * 60 * 1000),
      to: new Date()
    },
    month: {
      duration: 'month',
      sort: 'asc',
      from: new Date(thisYear, thisMonth, 1),
      to: new Date()
    },
    year: {
      duration: 'year',
      sort: 'asc',
      from: new Date(thisYear, 0, 1),
      to: new Date()
    },
    today: {
      duration: 'today',
      sort: 'desc',
      from: new Date(thisYear, thisMonth, thisDay),
      to: new Date(thisYear, thisMonth, thisDay, 23, 59, 59)
    },
    latest: {
      duration: 'latest (last week)',
      sort: 'desc',
      from: new Date(thisDate.getTime() - 7 * 24 * 60 * 60 * 1000),
      to: new Date()
    },
    yesterday: {
      duration: 'yesterday',
      sort: 'asc',
      from: new Date(thisYear, thisMonth, thisDay - 1),
      to: new Date(thisYear, thisMonth, thisDay - 1, 23, 59, 59)
    }
  };

  function pad(num, size) {
    var s = num + '';
    while (s.length < size) {
      s = '0' + s;
    }
    return s;
  }

  var regex = /\b(last month|last year|year|last week|week|month|today|yesterday|latest)\b/g;

  var parseTime = function(query) {
    var lang = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'en';

    var newQuery = void 0;
    var intent = void 0;
    var matches = query.match(regex);
    if (!matches) return;
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (
        var _iterator = matches[Symbol.iterator](), _step;
        !(_iteratorNormalCompletion = (_step = _iterator.next()).done);
        _iteratorNormalCompletion = true
      ) {
        var match = _step.value;

        intent = mappings[match];
        if (intent) newQuery = query.replace(intent.duration, '');

        if (intent.to && intent.from) {
          intent.timeRange = '[' + pad(intent.from.getTime(), 19) + ' TO ' + pad(intent.to.getTime(), 19) + ']';
        }
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }

    return {
      intent: intent,
      newQuery: newQuery
    };
  };

  var parsePopular = function(query) {
    var lang = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'en';
    var keyWords = languages[lang].keyWords;

    var re = new RegExp(regexes[lang].popular, 'gi');
    if (query.match(re)) {
      return {
        intent: {
          sort: 'desc',
          sortField: 'views'
        },
        newQuery: query.replace(keyWords['popular'], '')
      };
    }
  };

  var parseTags = function(query) {
    var lang = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'en';

    var newQuery = void 0;
    var tags = void 0;
    var re = new RegExp(regexes[lang].tagRegx, 'gi');
    if (query.match(re)) {
      var tagsArray = lang === 'zh' ? query.match(re)[0].split(' ') : query.match(re);
      for (var i = 0; i < tagsArray.length; i++) {
        newQuery = query.replace(tagsArray[i], '');
        tagsArray[i] = tagsArray[i].replace('#', '').replace('_', ' ');
      }
      tags = tagsArray.join(', ');
    }
    if (tags) {
      return {
        intent: {
          tags: tags
        },
        newQuery: newQuery
      };
    }
  };

  var parsers = {
    // this is a hack but user needs to go first
    parseUser: parse,
    parseType: parseType,
    parseLocation: parseLocation,
    parseOldest: parseOldest,
    parseTime: parseTime,
    parsePopular: parsePopular,
    parseTags: parseTags
  };

  var cleanInput = function(value) {
    var cleanedValue = value.toLowerCase().trim().replace(/|&|\.|;|!|\?|\(|\)|"|'|'$/g, '').replace(
      /\s+/g,
      ' '
      //  if it's only numbers, remove it
    );
    var digits = value.match(/\d/g);
    if (digits && digits.length === cleanedValue.length) return '';
    else return cleanedValue;
    // .replace(/[^\w]/g, ' ')
  };

  // L10n Config
  function parseIntent(query) {
    // console.log('og=' + query);
    if (!query || query.length < 1) return undefined;
    var stem = void 0;
    var overlap = [];
    var stemmed = [];
    var stopped = [];

    var results = [];
    var queryTerms = [];

    var intent = {
      sort: 'desc',
      sortField: 'modified'
      // location, keywords, user, tags, negative tags, duration,
      // timerange, sort, sortField, keywords, negative keywords, type
      // type, extent
    };
    var tagSearch = [];
    var lang = 'en';

    var stopWords = {
      tags: languages[lang].stopWords.tags,
      time: languages[lang].stopWords.time,
      geo: languages[lang].stopWords.geo,
      dict: languages[lang].stopWords.dict
    };

    query = cleanInput(query);
    // console.log('cleaned=' + query);

    if (query.length === 0) return intent;

    for (var parser in parsers) {
      query = cleanInput(query);
      var testValue = parsers[parser].caseSensitive ? query : query.toLowerCase();
      var parsedIntent = parsers[parser](testValue, lang);
      if (parsedIntent) {
        // console.log('parser=' + parser + ' parsedIntent=' + JSON.stringify(parsedIntent));
        intent = Object.assign(
          intent,
          parsedIntent.intent
          // TODO input is probably not being mutated correctly
        );
        query = parsedIntent.newQuery;
        // console.log('parser=' + parser + ' query=' + query);
      }
    }

    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (
        var _iterator = query.split(/\s/)[Symbol.iterator](), _step;
        !(_iteratorNormalCompletion = (_step = _iterator.next()).done);
        _iteratorNormalCompletion = true
      ) {
        var word = _step.value;

        if (stopWords.dict.indexOf(word) < 0 && stopWords.geo.indexOf(word) < 0) {
          if (stopWords.tags.indexOf(word) < 0) tagSearch.push(word);
          queryTerms.push(word);
          stem = memoizingStemmer(word);
          overlap.push(word.replace(stem, stem + '<b><u>') + '</u></b>');
          stemmed.push(stem);
          results.push(stem);
        } else {
          stopped.push(word);
        }
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }

    return {
      intent: intent,
      queryTerms: queryTerms,
      overlap: overlap,
      stemmed: stemmed,
      stopped: stopped,
      results: results
    };
  }

  var index = { parsers: parsers, parseIntent: parseIntent };

  return index;
});
//# sourceMappingURL=searchymcsearchface.umd.js.map
