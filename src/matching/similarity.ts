export class Similarity {
    static normalize(title: string): string {
        return title.toLowerCase().replace(/[^\w\s]/g, "").replace(/\s+/g, " ").trim();
    };

    static tokenize(title: string): string[] {
        return this.normalize(title).split(" ");
    }

    static score(a: string, b: string) {
        const tokensA = new Set(this.tokenize(a));
        const tokensB = new Set(this.tokenize(b));

        let common = 0;

        for (const token of tokensA) {
            if (tokensB.has(token)) {
                common++;
            }
        }
         return common / Math.max(tokensA.size,tokensB.size)
}
    }
   