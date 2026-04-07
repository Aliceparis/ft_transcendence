// fichier .types.ts comme .h / .hpp  --> sert à centraliser des types réutilisables pour que plusieurs fichiers les utilisent plutot que declarer x fois
// On retrouve --> types / interfaces / enums
// Utiliser le mot cle export au debut de chaque declaration

export type GameStatus = "Waiting" | "running" | "Finished"; // utile pour le front, les sockets et le jeu cote back

