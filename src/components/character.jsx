import React, { useState } from "react";

const characters = [
  {
    name: "Ako Udagawa",
    image:
      "https://bestdori.com/assets/en/ui/character_kv_image/024_rip/image.png",
    color: "#DD0088",
    instrument: "Dr.",
  },
  {
    name: "Moca Aoba",
    image:
      "https://bestdori.com/assets/en/ui/character_kv_image/022_rip/image.png",
    color: "#00AABB",
    instrument: "Gt.",
  },
  {
    name: "Yukina Minato",
    image:
      "https://bestdori.com/assets/en/ui/character_kv_image/021_rip/image.png",
    color: "#881188",
    instrument: "Vo.",
  },
  {
    name: "Lisa Imai",
    image:
      "https://bestdori.com/assets/en/ui/character_kv_image/023_rip/image.png",
    color: "#DD2200",
    instrument: "Ba.",
  },
  {
    name: "Rinko Shirokane",
    image:
      "https://bestdori.com/assets/en/ui/character_kv_image/025_rip/image.png",
    color: "#BBBBBB",
    instrument: "Key.",
  },
];

export default function AfterglowCharacters() {
  const [activeCharacter, setActiveCharacter] = useState(null);

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <div className="mb-6">
        <img
          src="https://bestdori.com/assets/en/band/logo/005_rip/logoL.png "
          alt="Afterglow"
          className="mx-auto"
          style={{ width: "150px", height: "75px" }}
        />
      </div>
      <div className="flex justify-center space-x-2">
        {characters.map((character) => (
          <div
            key={character.name}
            className="relative w-1/5 rounded-lg overflow-hidden cursor-pointer"
            style={{ backgroundColor: character.color, paddingBottom: "60%" }}
            onMouseEnter={() => setActiveCharacter(character)}
            onMouseLeave={() => setActiveCharacter(null)}
            onClick={() =>
              setActiveCharacter(
                activeCharacter === character ? null : character,
              )
            }
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-white text-center font-bold">
                {character.name}
              </p>
            </div>
            <div
              className={`absolute inset-0 transition-transform duration-300 ease-in-out ${
                activeCharacter === character ? "scale-110 z-10" : "scale-100"
              }`}
            >
              <img
                src={character.image}
                alt={character.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2 text-center">
              <p className="text-xs">{character.instrument}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
