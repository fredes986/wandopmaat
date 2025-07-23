"use client";
import { useState } from 'react';

export default function Home() {
  // State management voor de invoervelden
  const [length, setLength] = useState('');
  const [height, setHeight] = useState('');
  const [wallType, setWallType] = useState('voorzetwand');
  const [profileThickness, setProfileThickness] = useState(50);
  const [platingLayers, setPlatingLayers] = useState(1);
  const [plateType, setPlateType] = useState('standaard');
  const [hasInsulation, setHasInsulation] = useState(false);

  // --- Definitieve Prijzenstructuur (v3.0) ---
  const prices = {
    gipsplaat: { // Prijzen per m²
      standaard: 8.50,
      waterwerend: 12.00,
      brandwerend: 11.50,
    },
    // Stijlen: prijs per stuk, gebaseerd op handelslengte
    stijl: {
      50: [
        { maxHeight: 2600, price: 4.75 },
        { maxHeight: 2800, price: 5.00 },
        { maxHeight: 3000, price: 5.25 },
        { maxHeight: 3200, price: 5.50 },
        { maxHeight: 3600, price: 6.00 },
        { maxHeight: 4000, price: 6.75 },
      ],
      75: [
        { maxHeight: 2600, price: 5.50 },
        { maxHeight: 2800, price: 5.75 },
        { maxHeight: 3000, price: 6.00 },
        { maxHeight: 3200, price: 6.30 },
        { maxHeight: 3600, price: 7.00 },
        { maxHeight: 4000, price: 7.80 },
      ],
      100: [
        { maxHeight: 2600, price: 6.25 },
        { maxHeight: 2800, price: 6.55 },
        { maxHeight: 3000, price: 6.80 },
        { maxHeight: 3200, price: 7.15 },
        { maxHeight: 3600, price: 8.00 },
        { maxHeight: 4000, price: 8.90 },
      ],
    },
    ligger: { // Prijs per meter, per dikte
      50: 3.50,
      75: 4.00,
      100: 4.50,
    },
    isolatie: { // Prijs per m², per dikte
      50: 5.25,
      75: 6.50,
      100: 8.00,
    },
  };

  // --- SLIMSTE BEREKENINGEN (v2.0) ---
  const wallArea = length && height ? (Number(length) * Number(height)) / 1000000 : 0; // in m²

  // --- Materiaalberekeningen ---
  // 1. Gipsplaat
  let plasterboardArea = wallArea * platingLayers;
  if (wallType === 'scheidingswand') {
    plasterboardArea *= 2;
  }
  const plasterboardPrice = plasterboardArea * prices.gipsplaat[plateType];

  // 2. Profielen
  const studSpacing = 600;
  const numberOfStuds = length ? Math.ceil(Number(length) / studSpacing) + 1 : 0;

  // Zoek de juiste stijlprijs op basis van de wandhoogte
  const getStudPrice = () => {
    if (!height || !profileThickness) return 0;
    const priceBrackets = prices.stijl[profileThickness];
    const correctBracket = priceBrackets.find(bracket => Number(height) <= bracket.maxHeight);
    return correctBracket ? correctBracket.price : 0; // Prijs per stijl
  };
  const singleStudPrice = getStudPrice();
  const studPrice = numberOfStuds * singleStudPrice;

  const totalTrackLength = length ? (Number(length) * 2) / 1000 : 0; // in meters
  const trackPrice = totalTrackLength * prices.ligger[profileThickness];

  // 3. Isolatie
  const insulationArea = hasInsulation ? wallArea : 0;
  const insulationPrice = insulationArea * prices.isolatie[profileThickness];

  // --- Stel de materiaallijst samen ---
  let materials = [
    { name: `Gipsplaat (${plateType})`, quantity: plasterboardArea.toFixed(2), unit: 'm²', price: plasterboardPrice },
    { name: `Verticale stijlen (${profileThickness}mm)`, quantity: numberOfStuds, unit: 'stuks', price: studPrice },
    { name: 'Horizontale liggers', quantity: totalTrackLength.toFixed(2), unit: 'm', price: trackPrice },
  ];

  if (hasInsulation) {
    materials.push({ name: `Isolatie (${profileThickness}mm)`, quantity: insulationArea.toFixed(2), unit: 'm²', price: insulationPrice });
  }

  // --- Bereken de totaalprijs ---
  const totalPrice = materials.reduce((total, material) => total + material.price, 0);



  // 6. Stel de lijst samen van het type platen
  const plateOptions = [
    { id: 'standaard', name: 'Standaard' },
    { id: 'waterwerend', name: 'Waterwerend (WR)' },
    { id: 'brandwerend', name: 'Brandwerend (RF)' },
    { id: 'habito', name: 'Habito' },
  ];

  // 7. Functie die de bestelling naar de backend stuurt
  const handleOrder = async () => {
    const orderDetails = {
      typeWand: wallType,
      afmetingen: {
        lengte: length,
        hoogte: height,
      },
      materialen: materials,
      totaalprijs: totalPrice.toFixed(2),
      profileThickness: profileThickness,
      platingLayers: platingLayers,
      plateType: plateType,
      hasInsulation: hasInsulation,
    };

    try {
      // Stuur de data naar onze eigen API-route
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderDetails),
      });

      if (!response.ok) {
        throw new Error('Netwerkrespons was niet oké');
      }

      alert('Bestelling succesvol opgeslagen!');

    } catch (error) {
      console.error('Fout bij het plaatsen van de bestelling:', error);
      alert('Er is een fout opgetreden. De bestelling kon niet worden opgeslagen.');
    }
  };


  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
      <div className="p-8 rounded-lg shadow-md bg-white w-full max-w-md">

        <h1 className="text-4xl font-bold text-gray-800 text-center">
          WandOpMaat.be
        </h1>

        <p className="mt-2 text-lg text-gray-600 text-center">
          Stel hier je perfecte gyprocwand samen
        </p>

        <div className="mt-8 text-left space-y-4">

          {/* Veld voor Lengte */}
          <div>
            <label htmlFor="length" className="block text-sm font-medium text-gray-700">
              Lengte van de wand (in mm)
            </label>
            <div className="mt-1">
              <input
                type="number"
                name="length"
                id="length"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="bv. 4500"
                value={length}
                onChange={(e) => setLength(e.target.value)}
              />
            </div>
          </div>

          {/* Veld voor Hoogte */}
          <div>
            <label htmlFor="height" className="block text-sm font-medium text-gray-700">
              Hoogte van de wand (in mm)
            </label>
            <div className="mt-1">
              <input
                type="number"
                name="height"
                id="height"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="bv. 2600"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
              />
            </div>
          </div>

          {/* Veld voor Wandtype */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Type wand</label>
            <div className="mt-2 flex space-x-4">
              <div className="flex items-center">
                <input
                  id="voorzetwand"
                  name="wallType"
                  type="radio"
                  value="voorzetwand"
                  checked={wallType === 'voorzetwand'}
                  onChange={(e) => setWallType(e.target.value)}
                  className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="voorzetwand" className="ml-2 block text-sm text-gray-900">
                  Voorzetwand
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="scheidingswand"
                  name="wallType"
                  type="radio"
                  value="scheidingswand"
                  checked={wallType === 'scheidingswand'}
                  onChange={(e) => setWallType(e.target.value)}
                  className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="scheidingswand" className="ml-2 block text-sm text-gray-900">
                  Scheidingswand
                </label>
              </div>
            </div>
          </div>
          {/* --- Veld voor Profiel Dikte --- */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Dikte van de profielen</label>
            <div className="mt-2 flex items-center space-x-4">
              {[50, 75, 100].map((thickness) => (
                <div key={thickness} className="flex items-center">
                  <input
                    id={`dikte${thickness}`}
                    name="profileThickness"
                    type="radio"
                    value={thickness}
                    checked={profileThickness === thickness}
                    onChange={(e) => setProfileThickness(Number(e.target.value))}
                    className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor={`dikte${thickness}`} className="ml-2 block text-sm text-gray-900">
                    {thickness} mm
                  </label>
                </div>
              ))}
            </div>
          </div>
          {/* --- Veld voor Type Beplating --- */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Beplating</label>
            <div className="mt-2 flex items-center space-x-4">
              <div className="flex items-center">
                <input
                  id="enkeleBeplating"
                  name="platingType"
                  type="radio"
                  value={1}
                  checked={platingLayers === 1}
                  onChange={(e) => setPlatingLayers(Number(e.target.value))}
                  className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="enkeleBeplating" className="ml-2 block text-sm text-gray-900">
                  Enkel
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="dubbeleBeplating"
                  name="platingType"
                  type="radio"
                  value={2}
                  checked={platingLayers === 2}
                  onChange={(e) => setPlatingLayers(Number(e.target.value))}
                  className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="dubbeleBeplating" className="ml-2 block text-sm text-gray-900">
                  Dubbel
                </label>
              </div>
            </div>
          </div>
          {/* --- Veld voor Type Gipsplaat --- */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Type gipsplaat</label>
            <div className="mt-2 flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-4">
              {plateOptions.map((option) => (
                <div key={option.id} className="flex items-center">
                  <input
                    id={option.id}
                    name="plateType"
                    type="radio"
                    value={option.id}
                    checked={plateType === option.id}
                    onChange={(e) => setPlateType(e.target.value)}
                    className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor={option.id} className="ml-2 block text-sm text-gray-900">
                    {option.name}
                  </label>
                </div>
              ))}
            </div>
          </div>
          {/* --- Veld voor Isolatie --- */}
          <div className="relative flex items-start">
            <div className="flex h-6 items-center">
              <input
                id="insulation"
                name="insulation"
                type="checkbox"
                checked={hasInsulation}
                onChange={(e) => setHasInsulation(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </div>
            <div className="ml-3 text-sm leading-6">
              <label htmlFor="insulation" className="font-medium text-gray-900">
                Isolatie toevoegen
              </label>
            </div>
          </div>
        </div>

        {/* MATERIAALLIJST */}
        <div className="mt-8 w-full text-left">
          <h3 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4">
            Benodigde Materialen
          </h3>
          <ul className="space-y-2">
            {materials.map((material) => (
              <li
                key={material.name}
                className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
              >
                <span className="text-sm font-medium text-gray-800">{material.name}</span>
                <div className="flex items-center space-x-4">
                  <span className="font-mono text-sm text-gray-600 w-20 text-right">
                    {material.quantity} {material.unit}
                  </span>
                  <span className="font-mono font-semibold text-blue-600 w-24 text-right">
                    € {material.price.toFixed(2)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Totaalprijs */}
        <div className="mt-6 pt-4 border-t-2 border-gray-200 flex justify-between items-center">
          <span className="text-lg font-bold text-gray-900">Totaal (incl. BTW)</span>
          <span className="text-xl font-bold text-blue-700">€ {totalPrice.toFixed(2)}</span>
        </div>

        {/* Bestelknop */}
        <div className="mt-8">
          <button
            onClick={handleOrder}
            className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-transform transform hover:scale-105"
          >
            Bestel Nu
          </button>
        </div>

      </div>
    </main>
  )
}