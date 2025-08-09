document.addEventListener('DOMContentLoaded', () => {
    const factElement = document.getElementById('fact');
    const newFactButton = document.getElementById('new-fact-button');

    const facts = [
        "世界で最も一般的な名前はムハンマドです。",
        "カラスは人間の顔を覚えて、根に持つことができます。",
        "蝶は足で味を感じます。",
        "ラッコは寝るとき、離れ離れにならないように手をつなぎます。",
        "オクトパスには3つの心臓があります。",
        "牛には親友がいて、離されるとストレスを感じます。",
        "最初のコンピュータプログラマーは、エイダ・ラブレスという女性でした。",
        "バナナはベリー類ですが、イチゴはそうではありません。",
        "エッフェル塔は夏になると暑さで約15cm高くなります。",
        "人間の鼻は1兆種類以上の匂いを嗅ぎ分けることができます。"
    ];

    let currentFactIndex = -1;

    function getNewFact() {
        let randomIndex;
        do {
            randomIndex = Math.floor(Math.random() * facts.length);
        } while (facts.length > 1 && randomIndex === currentFactIndex);

        currentFactIndex = randomIndex;
        factElement.textContent = facts[randomIndex];
    }

    // ページ読み込み時に最初の豆知識を表示
    getNewFact();

    // ボタンクリックで新しい豆知識を表示
    newFactButton.addEventListener('click', getNewFact);
});
