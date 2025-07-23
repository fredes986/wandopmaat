"use client";
import { useState } from 'react';

export default function Home() {
  // State management voor de invoervelden
  const [length, setLength] = useState('');
  const [height, setHeight] = useState('');
  const [wallType, setWallType] = useState('voorzetwand');

  // --- Prijzen per eenheid (later kan dit uit een database komen) ---
  const prices = {
    gipsplaat: 8.50, // per m²
    stijl: 4.75,     // per stuk
    ligger: 3.50,    // per meter
  };

  // --- Live Berekeningen ---
  // 1. Bereken de basis wandoppervlakte in m²
  const wallArea = length && height ? (Number(length) * Number(height)) / 1000000 : 0;

  // 2. Bereken de totaal benodigde gipsplaat op basis van het wandtype
  let totalPlasterboardArea = wallArea; // Standaard is het 1x de oppervlakte
  if (wallType === 'scheidingswand') {
    // Maar als het een scheidingswand is, verdubbelen we het
    totalPlasterboardArea = wallArea * 2;
  }

  // 3. Bereken de benodigde metalen profielen
  const studSpacing = 600; // Standaard hart-op-hart afstand voor stijlen
  const numberOfStuds = length ? Math.ceil(Number(length) / studSpacing) + 1 : 0;
  const totalTrackLength = length ? Number(length) * 2 : 0; // Voor vloer en plafond

  // 4. Stel de materiaallijst samen, inclusief prijzen
  const materials = [
    { 
      name: 'Gipsplaat', 
      quantity: totalPlasterboardArea.toFixed(2), 
      unit: 'm²',
      price: totalPlasterboardArea * prices.gipsplaat
    },
    { 
      name: 'Verticale stijlen', 
      quantity: numberOfStuds, 
      unit: 'stuks',
      price: numberOfStuds * prices.stijl
    },
    { 
      name: 'Horizontale liggers', 
      quantity: (totalTrackLength / 1000).toFixed(2), 
      unit: 'm',
      price: (totalTrackLength / 1000) * prices.ligger
    },
  ];

  // 5. Bereken de totaalprijs
  const totalPrice = materials.reduce((total, material) => total + material.price, 0);

  // 6. Functie die de bestelling naar de backend stuurt
  const handleOrder = async () => {
    const orderDetails = {
      typeWand: wallType,
      afmetingen: {
        lengte: length,
        hoogte: height,
      },
      materialen: materials,
      totaalprijs: totalPrice.toFixed(2),
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