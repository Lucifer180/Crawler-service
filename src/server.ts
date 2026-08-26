import app from "./app";
import BrowserManager from "./browser/browserManager";
import "dotenv/config";

const PORT = process.env.PORT || 5000;

async function startServer (){
    await BrowserManager.init();

    app.listen(PORT, () => {
    console.log(`crawler running on ${PORT}`);
})
}

startServer();