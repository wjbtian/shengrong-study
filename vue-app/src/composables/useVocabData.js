import { ref, computed } from 'vue'

export function useVocabData() {
  const currentUnit = ref(-1)

  const vocabUnits = ref([
    {
      icon: '🏫',
      label: 'Unit 1',
      title: 'Our School Subjects',
      desc: '谈论学校课程',
      words: [
        { en: 'Maths', phonetic: '/mæθs/', cn: '数学', type: 'n.', example: 'I like Maths.', flipped: false },
        { en: 'English', phonetic: '/ˈɪŋɡlɪʃ/', cn: '英语', type: 'n.', example: 'We have English today.', flipped: false },
        { en: 'Chinese', phonetic: '/ˌtʃaɪˈniːz/', cn: '语文', type: 'n.', example: 'Chinese is interesting.', flipped: false },
        { en: 'PE', phonetic: '/ˌpiː ˈiː/', cn: '体育', type: 'n.', example: 'PE is fun.', flipped: false },
        { en: 'Science', phonetic: '/ˈsaɪəns/', cn: '科学', type: 'n.', example: 'Science is cool.', flipped: false },
        { en: 'Art', phonetic: '/ɑːrt/', cn: '美术', type: 'n.', example: 'I like Art class.', flipped: false },
        { en: 'Music', phonetic: '/ˈmjuːzɪk/', cn: '音乐', type: 'n.', example: 'Music is nice.', flipped: false },
        { en: 'subject', phonetic: '/ˈsʌbdʒɪkt/', cn: '科目', type: 'n.', example: 'What subjects do you like?', flipped: false },
      ],
      dialogues: [
        {
          title: '谈论课程',
          lines: [
            { speaker: 'A', text: 'What subjects do you like?' },
            { speaker: 'B', text: 'I like Maths and English.' },
            { speaker: 'A', text: 'What about you?' },
            { speaker: 'B', text: 'I like PE. It\'s fun.' },
          ]
        },
        {
          title: '介绍新课程',
          lines: [
            { speaker: 'A', text: 'Do you like Science?' },
            { speaker: 'B', text: 'Yes, I do. It\'s cool.' },
            { speaker: 'A', text: 'I like Art and Music.' },
            { speaker: 'B', text: 'Me too!' },
          ]
        },
      ]
    },
    {
      icon: '🕐',
      label: 'Unit 2',
      title: 'After School',
      desc: '课后活动安排',
      words: [
        { en: 'Monday', phonetic: '/ˈmʌndeɪ/', cn: '星期一', type: 'n.', example: 'Today is Monday.', flipped: false },
        { en: 'Tuesday', phonetic: '/ˈtjuːzdeɪ/', cn: '星期二', type: 'n.', example: 'We have PE on Tuesday.', flipped: false },
        { en: 'Wednesday', phonetic: '/ˈwenzdeɪ/', cn: '星期三', type: 'n.', example: 'Wednesday is busy.', flipped: false },
        { en: 'Thursday', phonetic: '/ˈθɜːzdeɪ/', cn: '星期四', type: 'n.', example: 'Thursday is fun.', flipped: false },
        { en: 'Friday', phonetic: '/ˈfraɪdeɪ/', cn: '星期五', type: 'n.', example: 'Friday is great!', flipped: false },
        { en: 'Saturday', phonetic: '/ˈsætədeɪ/', cn: '星期六', type: 'n.', example: 'Saturday is weekend.', flipped: false },
        { en: 'Sunday', phonetic: '/ˈsʌndeɪ/', cn: '星期日', type: 'n.', example: 'Sunday is relaxing.', flipped: false },
        { en: 'today', phonetic: '/təˈdeɪ/', cn: '今天', type: 'n.', example: 'What day is today?', flipped: false },
      ],
      dialogues: [
        {
          title: '课后活动',
          lines: [
            { speaker: 'A', text: 'What do you do after school?' },
            { speaker: 'B', text: 'I play football on Monday.' },
            { speaker: 'A', text: 'What about Tuesday?' },
            { speaker: 'B', text: 'I go swimming.' },
          ]
        },
        {
          title: '周末计划',
          lines: [
            { speaker: 'A', text: 'Do you play games on Saturday?' },
            { speaker: 'B', text: 'Yes, I do. I like Saturday.' },
            { speaker: 'A', text: 'What about Sunday?' },
            { speaker: 'B', text: 'I watch TV on Sunday.' },
          ]
        },
      ]
    },
    {
      icon: '🔢',
      label: 'Unit 3',
      title: 'How Many?',
      desc: '询问数量',
      words: [
        { en: 'thirteen', phonetic: '/ˌθɜːˈtiːn/', cn: '十三', type: 'num.', example: 'I am thirteen.', flipped: false },
        { en: 'fourteen', phonetic: '/ˌfɔːˈtiːn/', cn: '十四', type: 'num.', example: 'There are fourteen books.', flipped: false },
        { en: 'fifteen', phonetic: '/ˌfɪfˈtiːn/', cn: '十五', type: 'num.', example: 'I have fifteen pens.', flipped: false },
        { en: 'sixteen', phonetic: '/ˌsɪksˈtiːn/', cn: '十六', type: 'num.', example: 'Sixteen students are here.', flipped: false },
        { en: 'seventeen', phonetic: '/ˌsevənˈtiːn/', cn: '十七', type: 'num.', example: 'She is seventeen.', flipped: false },
        { en: 'eighteen', phonetic: '/ˌeɪˈtiːn/', cn: '十八', type: 'num.', example: 'There are eighteen chairs.', flipped: false },
        { en: 'nineteen', phonetic: '/ˌnaɪnˈtiːn/', cn: '十九', type: 'num.', example: 'Nineteen apples.', flipped: false },
        { en: 'twenty', phonetic: '/ˈtwenti/', cn: '二十', type: 'num.', example: 'I have twenty books.', flipped: false },
      ],
      dialogues: [
        {
          title: '数学生',
          lines: [
            { speaker: 'A', text: 'How many students are there?' },
            { speaker: 'B', text: 'There are sixteen students.' },
            { speaker: 'A', text: 'How many boys?' },
            { speaker: 'B', text: 'Nine boys and seven girls.' },
          ]
        },
        {
          title: '数物品',
          lines: [
            { speaker: 'A', text: 'How many books do you have?' },
            { speaker: 'B', text: 'I have twenty books.' },
            { speaker: 'A', text: 'Wow, so many!' },
            { speaker: 'B', text: 'Yes, I like reading.' },
          ]
        },
      ]
    },
    {
      icon: '🎨',
      label: 'Unit 4',
      title: 'Drawing in the Park',
      desc: '公园画画',
      words: [
        { en: 'draw', phonetic: '/drɔː/', cn: '画', type: 'v.', example: 'I can draw a tree.', flipped: false },
        { en: 'park', phonetic: '/pɑːk/', cn: '公园', type: 'n.', example: "Let's go to the park.", flipped: false },
        { en: 'river', phonetic: '/ˈrɪvə/', cn: '河', type: 'n.', example: 'The river is long.', flipped: false },
        { en: 'boat', phonetic: '/bəʊt/', cn: '船', type: 'n.', example: 'I see a boat.', flipped: false },
        { en: 'flower', phonetic: '/ˈflaʊə/', cn: '花', type: 'n.', example: 'The flower is beautiful.', flipped: false },
        { en: 'tree', phonetic: '/triː/', cn: '树', type: 'n.', example: 'The tree is tall.', flipped: false },
        { en: 'hill', phonetic: '/hɪl/', cn: '小山', type: 'n.', example: 'There is a hill.', flipped: false },
        { en: 'lake', phonetic: '/leɪk/', cn: '湖', type: 'n.', example: 'The lake is big.', flipped: false },
      ],
      dialogues: [
        {
          title: '在公园画画',
          lines: [
            { speaker: 'A', text: "Let's go to the park." },
            { speaker: 'B', text: 'Great! I can draw.' },
            { speaker: 'A', text: 'What can you draw?' },
            { speaker: 'B', text: 'I can draw a boat and flowers.' },
          ]
        },
        {
          title: '描述风景',
          lines: [
            { speaker: 'A', text: 'What can you see?' },
            { speaker: 'B', text: 'I can see a river and a hill.' },
            { speaker: 'A', text: 'The flowers are beautiful.' },
            { speaker: 'B', text: 'Yes, I like the park.' },
          ]
        },
      ]
    },
    {
      icon: '🌳',
      label: 'Unit 5',
      title: 'Seasons',
      desc: '四季变化',
      words: [
        { en: 'spring', phonetic: '/sprɪŋ/', cn: '春天', type: 'n.', example: 'Spring is warm.', flipped: false },
        { en: 'summer', phonetic: '/ˈsʌmə/', cn: '夏天', type: 'n.', example: 'Summer is hot.', flipped: false },
        { en: 'autumn', phonetic: '/ˈɔːtəm/', cn: '秋天', type: 'n.', example: 'Autumn is cool.', flipped: false },
        { en: 'winter', phonetic: '/ˈwɪntə/', cn: '冬天', type: 'n.', example: 'Winter is cold.', flipped: false },
        { en: 'warm', phonetic: '/wɔːm/', cn: '温暖的', type: 'adj.', example: 'It is warm in spring.', flipped: false },
        { en: 'hot', phonetic: '/hɒt/', cn: '热的', type: 'adj.', example: 'Summer is very hot.', flipped: false },
        { en: 'cool', phonetic: '/kuːl/', cn: '凉爽的', type: 'adj.', example: 'Autumn is cool.', flipped: false },
        { en: 'cold', phonetic: '/kəʊld/', cn: '冷的', type: 'adj.', example: 'Winter is very cold.', flipped: false },
      ],
      dialogues: [
        {
          title: '谈论季节',
          lines: [
            { speaker: 'A', text: 'What season do you like?' },
            { speaker: 'B', text: "I like spring. It's warm." },
            { speaker: 'A', text: 'I like winter.' },
            { speaker: 'B', text: "Why? It's cold." },
          ]
        },
        {
          title: '季节活动',
          lines: [
            { speaker: 'A', text: "It's hot in summer." },
            { speaker: 'B', text: 'I go swimming in summer.' },
            { speaker: 'A', text: "I like autumn. It's cool." },
            { speaker: 'B', text: 'We can fly kites in spring.' },
          ]
        },
      ]
    },
    {
      icon: '👕',
      label: 'Unit 6',
      title: 'Whose Dress Is This?',
      desc: '衣物归属',
      words: [
        { en: 'dress', phonetic: '/dres/', cn: '连衣裙', type: 'n.', example: 'This is my dress.', flipped: false },
        { en: 'coat', phonetic: '/kəʊt/', cn: '外套', type: 'n.', example: 'Put on your coat.', flipped: false },
        { en: 'shirt', phonetic: '/ʃɜːt/', cn: '衬衫', type: 'n.', example: 'He wears a shirt.', flipped: false },
        { en: 'sweater', phonetic: '/ˈswetə/', cn: '毛衣', type: 'n.', example: 'The sweater is warm.', flipped: false },
        { en: 'jacket', phonetic: '/ˈdʒækɪt/', cn: '夹克', type: 'n.', example: 'I like this jacket.', flipped: false },
        { en: 'trousers', phonetic: '/ˈtraʊzəz/', cn: '裤子', type: 'n.', example: 'These are my trousers.', flipped: false },
        { en: 'shorts', phonetic: '/ʃɔːts/', cn: '短裤', type: 'n.', example: 'I wear shorts in summer.', flipped: false },
        { en: 'gloves', phonetic: '/ɡlʌvz/', cn: '手套', type: 'n.', example: 'I need gloves.', flipped: false },
      ],
      dialogues: [
        {
          title: '这是谁的',
          lines: [
            { speaker: 'A', text: 'Whose dress is this?' },
            { speaker: 'B', text: "It's my sister's." },
            { speaker: 'A', text: 'Whose coat is that?' },
            { speaker: 'B', text: "It's my father's." },
          ]
        },
        {
          title: '穿什么',
          lines: [
            { speaker: 'A', text: "It's cold. Put on your sweater." },
            { speaker: 'B', text: 'Where are my gloves?' },
            { speaker: 'A', text: 'They are on the bed.' },
            { speaker: 'B', text: 'Thank you!' },
          ]
        },
      ]
    },
    {
      icon: '🌡️',
      label: 'Unit 7',
      title: "What's the Matter?",
      desc: '询问状况',
      words: [
        { en: 'tired', phonetic: '/taɪəd/', cn: '累的', type: 'adj.', example: 'I am tired.', flipped: false },
        { en: 'ill', phonetic: '/ɪl/', cn: '生病的', type: 'adj.', example: 'He is ill.', flipped: false },
        { en: 'hungry', phonetic: '/ˈhʌŋɡri/', cn: '饿的', type: 'adj.', example: 'I am hungry.', flipped: false },
        { en: 'thirsty', phonetic: '/ˈθɜːsti/', cn: '渴的', type: 'adj.', example: 'She is thirsty.', flipped: false },
        { en: 'happy', phonetic: '/ˈhæpi/', cn: '高兴的', type: 'adj.', example: 'I am happy.', flipped: false },
        { en: 'sad', phonetic: '/sæd/', cn: '伤心的', type: 'adj.', example: "Don't be sad.", flipped: false },
        { en: 'matter', phonetic: '/ˈmætə/', cn: '事情', type: 'n.', example: "What's the matter?", flipped: false },
        { en: 'feel', phonetic: '/fiːl/', cn: '感觉', type: 'v.', example: 'I feel good.', flipped: false },
      ],
      dialogues: [
        {
          title: '怎么了',
          lines: [
            { speaker: 'A', text: "What's the matter?" },
            { speaker: 'B', text: "I'm tired and hungry." },
            { speaker: 'A', text: "Here's some food." },
            { speaker: 'B', text: 'Thank you. I feel better.' },
          ]
        },
        {
          title: '关心朋友',
          lines: [
            { speaker: 'A', text: "You look sad. What's wrong?" },
            { speaker: 'B', text: "I'm ill. I can't play." },
            { speaker: 'A', text: "I'm sorry. Have a rest." },
            { speaker: 'B', text: "Thanks. I'll be fine." },
          ]
        },
      ]
    },
    {
      icon: '🏠',
      label: 'Unit 8',
      title: 'How Are You?',
      desc: '问候与告别',
      words: [
        { en: 'fine', phonetic: '/faɪn/', cn: '好的', type: 'adj.', example: 'I am fine.', flipped: false },
        { en: 'well', phonetic: '/wel/', cn: '好地', type: 'adv.', example: 'I am well.', flipped: false },
        { en: 'good', phonetic: '/ɡʊd/', cn: '好的', type: 'adj.', example: 'Good morning!', flipped: false },
        { en: 'bye', phonetic: '/baɪ/', cn: '再见', type: 'int.', example: 'Bye! See you.', flipped: false },
        { en: 'hello', phonetic: '/həˈləʊ/', cn: '你好', type: 'int.', example: 'Hello! How are you?', flipped: false },
        { en: 'thanks', phonetic: '/θæŋks/', cn: '谢谢', type: 'n.', example: 'Thanks a lot.', flipped: false },
        { en: 'welcome', phonetic: '/ˈwelkəm/', cn: '不客气', type: 'adj.', example: 'You are welcome.', flipped: false },
        { en: 'please', phonetic: '/pliːz/', cn: '请', type: 'adv.', example: 'Please sit down.', flipped: false },
      ],
      dialogues: [
        {
          title: '问候',
          lines: [
            { speaker: 'A', text: 'Hello! How are you?' },
            { speaker: 'B', text: "I'm fine, thanks. And you?" },
            { speaker: 'A', text: "I'm well too." },
            { speaker: 'B', text: "Good! Let's play." },
          ]
        },
        {
          title: '告别',
          lines: [
            { speaker: 'A', text: 'Goodbye! See you tomorrow.' },
            { speaker: 'B', text: 'Bye! Have a good day.' },
            { speaker: 'A', text: 'You too!' },
            { speaker: 'B', text: 'Please come to my home.' },
          ]
        },
      ]
    },
  ])

  const allWordsCount = computed(() => {
    return vocabUnits.value.reduce((sum, unit) => sum + unit.words.length, 0)
  })

  const currentWords = computed(() => {
    if (currentUnit.value === -1) {
      return vocabUnits.value.flatMap(unit => unit.words)
    }
    return vocabUnits.value[currentUnit.value].words
  })

  return {
    currentUnit,
    vocabUnits,
    allWordsCount,
    currentWords
  }
}
