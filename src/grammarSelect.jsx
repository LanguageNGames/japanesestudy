import { useState } from "react";

export default function GrammarSelect({
  BASE_PATH,
  onExit,
  setView,
  setGrammarConfig,
  initialLevel,
}) {
  const levels = ["N5", "N4", "N3", "N2", "N1"];

  const grammarData = {
    N5: {
      beginner: {
        title: "Beginner N5",
        points: [
          {key: "topic_wa", label: "Topic は"},
          {key: "possessive_no", label: "Possessive の"},
          {key: "inclusion_mo", label: "Inclusion も"},
          {key: "interrogative_ka", label: "Interrogative か"},
          {key: "time_ni", label: "Time に"},
          {key: "kara_made", label: "から まで"},
          {key: "and_to", label: "\"and\" と"},
          {key: "towards_e", label: "Towards へ"},
          {key: "exclusive_mo", label: "Exclusive も"},
          {key: "accompaniment_to", label: "Accompaniment と"},
          {key: "means_de", label: "Means/tools で"},
          {key: "direct_object_o", label: "DO を"},
          {key: "place_de", label: "Place で"},
          {key: "invitation_mashou", label: "ませんか、ましょう"},
          {key: "giving_receiving", label: "Giving/receiving"},
          {key: "mou_mada", label: "もう、まだ"},
          {key: "adjective_conjugation", label: "Adjective conjugation"}
        ]
      },
      intermediate: {
        title: "Intermediate N5",
        points: [
          {key: "totemo_amari", label: "とても/あまり"},
          {key: "conjunction_ga", label: "Conjunction が"},
          {key: "dou_donna", label: "どう/どんな"},
          {key: "adverbs", label: "Adverbs"},
          {key: "subject_ga_adj", label: "Subject が + adjective"},
          {key: "reason_kara", label: "Cause/Reason から"},
          {key: "position_ni", label: "Position に"},
          {key: "ya_particle", label: "\"and\" (etc) や"},
          {key: "frequency_ni_kai", label: "～に～回"},
          {key: "comparison_yori_houga", label: "より、のほうが"},
          {key: "range_no_naka_de", label: "(の中)で"},
          {key: "no_replacing_noun", label: "の replacing noun"},
          {key: "hoshii_tai", label: "ほしい/たい"},
          {key: "purpose_ni", label: "Purpose に"},
          {key: "some_ka", label: "\"Some\" か"},
          {key: "teimasu_moii_waikemasen", label: "ています/もいい/はいけません"}
        ]
      },
      advanced: {
        title: "Advanced N5",
        points: [
          {key: "intransitive_ni_wo", label: "Intransitive verbs に/を"},
          {key: "conjunctions_te", label: "Conjunctions with て"},
          {key: "naide_nakutemo_nakereba", label: "ないで、なくても、なければ"},
          {key: "dictionary_form", label: "Dictionary form"},
          {key: "made_ni", label: "までに"},
          {key: "mae_ni", label: "まえに"},
          {key: "takotoga_taritari", label: "たことが、たり～たり"},
          {key: "contrast_wa", label: "Contrast は"},
          {key: "adj_noun_narimasu", label: "Adj/noun なります"},
          {key: "to_omoimasu_toiimasu", label: "と思います/と言います"},
          {key: "deshou", label: "でしょう"},
          {key: "subordinate_modifying_noun", label: "Subordinate modifying noun"},
          {key: "toki", label: "とき"},
          {key: "conditional_to", label: "Conditional と"},
          {key: "give_receive_actions", label: "Give/receive actions"},
          {key: "conditional_tara", label: "Conditional たら"},
          {key: "even_if_temo", label: "Even if ても"}
        ]
      }
    },
    N4: {
      beginner: {
        title: "Beginner N4",
        points: [
          {key: "ndesu", label: "んです"},
          {key: "tara_iidesu", label: "たらいいです"},
          {key: "kanoukei", label: "可能形"},
          {key: "dake_shika", label: "だけ / しか"},
          {key: "nagara", label: "ながら"},
          {key: "shi_shi", label: "し～し"},
          {key: "transitive/intransitive_N4", label: "自動詞ています / 他動詞てあります"},
          {key: "teshimaimasu", label: "てしまいます"},
          {key: "teokimasu", label: "ておきます"},
          {key: "toka_toka", label: "とか / とか"},
          {key: "ikou_to_omotteimasu", label: "意向形(と思っています)"},
          {key: "mada_teimasen", label: "まだていません"},
          {key: "ta_naihouga", label: "た / ない方がいいです"},
          {key: "deshou", label: "でしょう"},
          {key: "kamoshiremasen", label: "かもしれません"},
          {key: "quantity_de", label: "quantityで"},
          {key: "imperative_prohibitive", label: "命令形 / 禁止形"},
          {key: "to_itteimashita_tsutaete", label: "と言っていました/伝えていただけませんか"},
          {key: "to_kaitearimasu", label: "と書いてあります / と読みます"},
        ]
      },
      intermediate: {
        title: "Intermediate N4",
        points: [
          {key: "toiu_imi", label: "という意味 / どういう意味"},
          {key: "toori_ni", label: "とおりに"},
          {key: "atode", label: "後で"},
          {key: "te_naide", label: "て / ないで"},
          {key: "ba_nara_baiidesu", label: "ば / なら / ばいいです"},
          {key: "youni", label: "１ように２"},
          {key: "youninarimasu", label: "ようになります"},
          {key: "younishimasu", label: "ようにします"},
          {key: "ukemikei", label: "受身形"},
          {key: "kara_de_tsukurareteimasu", label: "から / で作られています"},
          {key: "v_noha_noga_noo", label: "Vのは / のが / のを"},
          {key: "no(pronoun)ha", label: "の(pronoun)は～"},
          {key: "action_reaction", label: "actionてreaction"},
          {key: "node", label: "AのでB"},
          {key: "subsentence_ka", label: "sub-sentenceか"},
          {key: "kadouka", label: "かどうか"},
          {key: "temimasu", label: "てみます"},
          {key: "adj_sa_mi", label: "Adjさ / み"},
          {key: "give_receive", label: "give / receive"},
        ]
      },
      advanced: {
        title: "Advanced N4",
        points: [
          {key: "tameni", label: "ために"},
          {key: "noni_purpose", label: "(の)に (purpose)"},
          {key: "niyotte_ukemikei", label: "によって受身形"},
          {key: "sou_desu_looks", label: "～そうです (looks like)"},
          {key: "sugimasu", label: "～すぎます"},
          {key: "yasui_nikui", label: "～やすい / にくい"},
          {key: "adj_noun_ni_shimasu", label: "Adj / noun (に)します"},
          {key: "baai", label: "場合"},
          {key: "noni_despite", label: "のに (despite)"},
          {key: "tokorodesu", label: "る / た / ているところです"},
          {key: "tabakari", label: "～たばかり"},
          {key: "hazu", label: "はず"},
          {key: "sou_desu_heard", label: "そうです (heard)"},
          {key: "youdesu", label: "Plain ようです"},
          {key: "sense_ga_shimasu", label: "Sense がします"},
          {key: "shiekikei", label: "使役形"},
          {key: "shiekikei_te_itadakemasenka", label: "使役形ていただけませんか"},
          {key: "sonkeigo", label: "尊敬語"},
          {key: "kenjougo", label: "謙譲語"},
        ]
      },
    },
    N3: {
      beginner: {
        title: "Beginner N3",
        points: [
          { "key": "te_kamaemasenka_itadakemasenka_moraenai", "label": "てかまえませんか/いただけませんか/もらえないでしょうか/いただけないでしょうか" },
          { "key": "you_ni_you_na_you_da", "label": "ように、ような、ようだ" },
          { "key": "koto_wa_ga_wo", "label": "～ことは/が/を" },
          { "key": "wo_to_iu", "label": "～を～と言う" },
          { "key": "to_iu_noun", "label": "～と言う～" },
          { "key": "question_te_mo", "label": "いつ/どこ/何/だれ/どんなに～ても" },
          { "key": "janakute", "label": "じゃなくて、～" },
          { "key": "no_da", "label": "のだ/のではない" },
          { "key": "nan_nin_mo", "label": "何人も/何回もetc" },
          { "key": "tara_ta", "label": "たら～た" },
          { "key": "to_iu_no_wa", "label": "～というのは～のことだ/ということだ" },
          { "key": "you_ni_iu", "label": "ように言う/注意する/伝える/頼む" },
          { "key": "mitai", "label": "～みたいに/みたいな/みたいだ" },
          { "key": "shieki_moraemasenka", "label": "使役刑もらえませんか/いただけませんか" },
          { "key": "koto_ni_suru", "label": "～ことにする/している" },
          { "key": "koto_ni_naru", "label": "～ことになる/なっている" },
          { "key": "te_naide_hoshii", "label": "～て/ないでほしい" },
          { "key": "sou_na_sou_ni", "label": "～そうな/そうに" },
          { "key": "na_sou_da", "label": "～なさそうだ" },
          { "key": "ta_ato_de", "label": "～たあと(で)" },
          { "key": "dake_shika", "label": "だけしか" },
          { "key": "sae", "label": "さえ" },
          { "key": "koso", "label": "こそ" },
          { "key": "to_iu_koto_da", "label": "～ということだ" },
          { "key": "chau_toku_teru", "label": "ちゃう/とく/てる" },
          { "key": "shieki_ukemi", "label": "使役受け身" },
          { "key": "de_aru", "label": "(の)である" },
          { "key": "renyou_chuushi", "label": "連用中止刑" },
          { "key": "tagaru", "label": "～(た)がる/がっている" },
          { "key": "mashite_mashitara", "label": "まして/ましたら" },
          { "key": "ni_kanshite", "label": "に関して(は/も)" },
          { "key": "ni_tsuite", "label": "について(の/は/も)" },
          { "key": "ni_yoreba", "label": "によれば/よると" },
          { "key": "ni_yotte", "label": "によって/より/よる" },
          { "key": "koto_wa_nai", "label": "ことはない" },
        ]
      },
      intermediate:{
        title: "Intermediate N3",
        points: [
          { "key": "toiu_koto_da_typo", "label": "とうことだ" },
          { "key": "koto_da", "label": "ことだ" },
          { "key": "donnani_koto_ka", "label": "どんなに～ことか" },
          { "key": "njanai", "label": "んじゃない？" },
          { "key": "ta_tokoro", "label": "～たところに/で/を" },
          { "key": "you_to_suru", "label": "～ようとする/しない" },
          { "key": "futsuu_no_darouka", "label": "普通刑のだろうか" },
          { "key": "no_particles", "label": "との/での/からの/までの/への" },
          { "key": "darou", "label": "～だろう/だろうとおもう" },
          { "key": "verb_noun", "label": "～が/の動詞+名詞" },
          { "key": "beki", "label": "～べきだ" },
          { "key": "furi", "label": "～ふりをする" },
          { "key": "tte", "label": "て/って(replaceと/は/という)" },
          { "key": "tsumori", "label": "つもりだった/たつもり/ているつもり" },
          { "key": "bakari", "label": "Nばかり/てばかり(で/の/いる)" },
          { "key": "toka", "label": "とか" },
          { "key": "te_kuru_iku", "label": "て来る/て行く" },
          { "key": "tsuide", "label": "ついでに" },
          { "key": "tabi_ni", "label": "度に" },
          { "key": "tatotan", "label": "たとたん" },
          { "key": "saichuu", "label": "最中に" },
          { "key": "nakutewa", "label": "なくてはならない/いけない" },
          { "key": "nakutemo", "label": "なくてもかまわない" },
          { "key": "dake_de", "label": "普通刑だけ(でいい)" },
          { "key": "kana", "label": "かな" },
          { "key": "nanka_nante", "label": "なんか/なんて" },
          { "key": "nara", "label": "普通刑なら" },
          { "key": "ni_totte", "label": "にとって" },
          { "key": "warini", "label": "わりに(は)" },
          { "key": "kuseni", "label": "くせに" },
          { "key": "okage_sei", "label": "おかげで/せいで" },
          { "key": "kawari_ni", "label": "かわりに/にかわって" },
          { "key": "ni_shitara", "label": "にしたら/としたら" },
          { "key": "to_shitemo", "label": "としても/～を～として" },
          { "key": "aida", "label": "あいだ/あいだに" },
          { "key": "made", "label": "まで/までに" },
        ]
      },
      advanced:{
        title: "Advanced N3",
        points: [
          { "key": "ta_noun", "label": "た(=ている)+名詞" },
          { "key": "mama", "label": "たまま/のまま" },
          { "key": "meishi_wo_shiteiru", "label": "名詞をしている" },
          { "key": "nazenara", "label": "なぜなら" },
          { "key": "o_desu", "label": "お～です" },
          { "key": "temo_kamawanai", "label": "てもかまわない" },
          { "key": "hodo_nai", "label": "ほど～ない/ほどではない" },
          { "key": "hodo_wa_nai", "label": "ほど～はない/いない" },
          { "key": "tame", "label": "ため(に)/ためだ(N3)" },
          { "key": "tara_ba_ta", "label": "たら/ば～た" },
          { "key": "wa_mochiron", "label": "1はもちろん2(も)" },
          { "key": "bakari_ka", "label": "ばかりか" },
          { "key": "ni_kurabete", "label": "にくらべて" },
          { "key": "ni_taishite", "label": "にたいして" },
          { "key": "hazu", "label": "普通刑はずだ/はずがない" },
          { "key": "hazu_datta", "label": "はずだった" },
          { "key": "koto_ga_aru", "label": "ことが/もある" },
          { "key": "kekka", "label": "た/の結果" },
          { "key": "verb_dasu", "label": "動詞+出す" },
          { "key": "verb_hajimaru", "label": "動詞+始まる/終わる/続ける" },
          { "key": "verb_aux", "label": "動詞+忘れる/会う/換える" },
          { "key": "verb_ageru", "label": "動詞+上げる/切れない/かけ/たて" },
          { "key": "yori_hou", "label": "普通刑より普通刑ほうが" },
          { "key": "rashii_ppoi", "label": "らしい/っぽい" },
          { "key": "zu_ni", "label": "ず(に)" },
          { "key": "ta_tokoro_n3", "label": "たところ(N3)" },
          { "key": "jisho_tokoro_datta", "label": "辞書形ところだった" },
          { "key": "te_hajimete", "label": "て初めて" },
          { "key": "uchi_ni", "label": "うちに" },
          { "key": "mono_mon_dakara", "label": "もの/もんだから" },
          { "key": "rareru_kansetsu", "label": "(ら)れる(間接受身形)" },
          { "key": "tari_n3", "label": "たり～たり(N3)" },
          { "key": "ppanashi", "label": "っぱなし" },
          { "key": "dochira_ka_to_ieba", "label": "どちらかと言えば、～ほうだ" },
          { "key": "masu_youni", "label": "ます/ませんように" },
          { "key": "zenzen_nai", "label": "決して/まったく/めったに/すこしも～ない" }
        ]
      }
    },
    N2: {
      beginner:{
        title: "Beginner N2",
        points: [

        ]
      },
      intermediate:{
        title: "Intermediate N3",
        points: [

        ]
      },
      advanced:{
        title: "Advanced N3",
        points: [
          
        ]
      }
    },
    N1: {
      beginner:{
        title: "Beginner N2",
        points: [

        ]
      },
      intermediate:{
        title: "Intermediate N3",
        points: [

        ]
      },
      advanced:{
        title: "Advanced N3",
        points: [
          
        ]
      }
    },
  };

  const [selectedLevel, setSelectedLevel] = useState(initialLevel || null);
  const [selectedGrammar, setSelectedGrammar] = useState([]);
  

  const toggleGrammar = (point) => {
    setSelectedGrammar((prev) =>
      prev.includes(point)
        ? prev.filter((item) => item !== point)
        : [...prev, point]
    );
  };

  const toggleGroup = (groupPoints) => {
    const allSelected = groupPoints.every((point) =>
      selectedGrammar.includes(point)
    );

    if (allSelected) {
      setSelectedGrammar((prev) =>
        prev.filter((item) => !groupPoints.includes(item))
      );
    } else {
      setSelectedGrammar((prev) => [
        ...new Set([...prev, ...groupPoints]),
      ]);
    }
  };

  return (
  <div className="flex-center flex-column">
    <h1>Grammar Game</h1>

    {/* LEVEL SELECTION SCREEN */}
    {!selectedLevel && (
      <>
        {levels.map((level) => (
          <button
            key={level}
            className="btn"
            onClick={() => setSelectedLevel(level)}
          >
            {level}
          </button>
        ))}
      </>
    )}

    {/* GRAMMAR SELECTION SCREEN */}
    {selectedLevel && (
      <>
        {/* GAME BUTTON SPACE */}
        <div className="grammar-game-buttons">
          <div className="grammar-game-buttons">
            <button
              className="btn"
              onClick={() => {
                setGrammarConfig({
                  level: selectedLevel,
                  grammar: selectedGrammar,
                });

                setView({
                  screen: "grammarFillBlanks",
                  level: selectedLevel,
                });
              }}
            >
              Fill in the Blank
            </button>
            <button
              className="btn"
              onClick={() => {
                setGrammarConfig({
                  level: selectedLevel,
                  difficulty: null,
                  grammar: selectedGrammar,
                });

                setView({
                  screen: "grammarOrder",
                  level: selectedLevel,
                });
              }}
            >
              Order the sentences
            </button>
          </div>
        </div>

        {/* GRAMMAR GROUPS */}
        <div className="grammar-groups-container">
          {Object.values(grammarData[selectedLevel]).map((group) => {
            const allSelected = group.points.every((point) =>
              selectedGrammar.includes(point.key)
            );

            return (
              <div className="grammar-group" key={group.title}>
                <div className="grammar-group-header">
                  <h3>{group.title}</h3>
                  <div className="quick-actions">
                  <button
                    onClick={() => toggleGroup(group.points.map((p) => p.key))}
                  >
                    {allSelected ? "None" : "All"}
                  </button>
                  </div>
                </div>

                <div className="grammar-list">
                  {group.points.map((point) => (
                    <label className="grammar-item" key={point.key}>
                      <input
                        type="checkbox"
                        checked={selectedGrammar.includes(point.key)}
                        onChange={() => toggleGrammar(point.key)}
                      />
                      <span>{point.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </>
    )}

    {/* BACK BUTTON */}
    <button className="btn" onClick={() => setView({ screen: "home" })}>
      Back
  </button>
  </div>
);
}