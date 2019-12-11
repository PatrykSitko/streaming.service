import { io as socketIO } from "../bin/www.mjs";

export default {
  connect: () => {
    socketIO.on("connection", client => {
      client.emit("categories", [
        "Akcja",
        "Animowane",
        "Biografie",
        "Dokumentalne",
        "Dramat",
        "Familijne",
        "Fantasty",
        "Historyczne",
        "Horror",
        "Katastroficzne",
        "Komedia",
        "Kostiumowe",
        "Musical",
        "Obyczajowy",
        "Polskie",
        "Przygodowe",
        "Sci-Fi",
        "Sensacyjne",
        "Sport",
        "Thriller",
        "Wojenne"
      ]);
      client.on("store", clientData => {
        console.log(clientData);
      });
    });
  }
};
