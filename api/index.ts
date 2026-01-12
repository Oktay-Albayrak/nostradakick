import { app } from "./src/app.ts";
import { config } from "./config.ts";


app.listen(config.port, () => {
    console.log(`Server started at http://localhost:${config.port}`);
});