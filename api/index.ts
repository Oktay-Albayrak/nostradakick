import { app } from "./src/app.ts";
import { config } from "./config.ts";





// lancement de l'app express
app.listen(config.port, () => {
    console.log(`Server started at http://localhost:${config.port}`);
});