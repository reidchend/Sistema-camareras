/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  Hotel, 
  Users, 
  ChevronRight, 
  RotateCcw, 
  Utensils, 
  Bed, 
  User, 
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Settings2,
  Brush,
  Info,
  Shuffle,
  Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Room, RoomType, HousekeeperAssignment, RoomCounts } from './types';
import { distributeRooms } from './utils/distribution';

// Initial room setup (2 to 40)
const INITIAL_ROOMS: Room[] = Array.from({ length: 39 }, (_, i) => {
  const num = i + 2;
  let type: RoomType = 'matrimonial';
  let floor = 0;

  // Floor distribution:
  // 2-17: Planta Baja (0)
  // 18-33: Primer Piso (1)
  // 34-40: Segundo Piso (2)
  if (num >= 2 && num <= 17) floor = 0;
  else if (num >= 18 && num <= 33) floor = 1;
  else if (num >= 34 && num <= 40) floor = 2;
  
  // Custom initial distribution based on user's first prompt:
  // 5 doubles, 3 triples, 1 quintuple, 1 individual, rest matrimonial
  if (num >= 2 && num <= 4) type = 'triple'; 
  else if (num >= 5 && num <= 9) type = 'double'; 
  else if (num === 10) type = 'quintuple'; 
  else if (num === 11) type = 'individual'; 
  
  return {
    number: num,
    type,
    isDirty: true,
    floor
  };
});

const ROOM_TYPES: RoomType[] = ['matrimonial', 'double', 'triple', 'quintuple', 'individual'];

export default function App() {
  const [rooms, setRooms] = useState<Room[]>(INITIAL_ROOMS);
  const [housekeeperNames, setHousekeeperNames] = useState<string[]>(['Camarera 1', 'Camarera 2', 'Camarera 3']);
  const [restaurantCleanerIndex, setRestaurantCleanerIndex] = useState<number>(0);
  const [assignments, setAssignments] = useState<HousekeeperAssignment[]>([]);
  const [isDistributed, setIsDistributed] = useState(false);
  const [activeTab, setActiveTab] = useState<'config' | 'housekeepers'>('config');

  const toggleRoomDirty = (roomNumber: number) => {
    setRooms(prev => prev.map(r => r.number === roomNumber ? { ...r, isDirty: !r.isDirty } : r));
  };

  const cycleRoomType = (roomNumber: number, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent toggling dirty status
    setRooms(prev => prev.map(r => {
      if (r.number === roomNumber) {
        const currentIndex = ROOM_TYPES.indexOf(r.type);
        const nextIndex = (currentIndex + 1) % ROOM_TYPES.length;
        return { ...r, type: ROOM_TYPES[nextIndex] };
      }
      return r;
    }));
  };

  const addHousekeeper = () => {
    setHousekeeperNames(prev => [...prev, `Camarera ${prev.length + 1}`]);
  };

  const removeHousekeeper = (index: number) => {
    if (housekeeperNames.length <= 1) return;
    
    const newNames = housekeeperNames.filter((_, i) => i !== index);
    setHousekeeperNames(newNames);
    
    // Adjust restaurant cleaner index
    if (restaurantCleanerIndex === index) {
      // If we delete the restaurant cleaner, assign it to the first one available
      setRestaurantCleanerIndex(0);
    } else if (restaurantCleanerIndex > index) {
      // If we delete someone before the restaurant cleaner, shift the index back
      setRestaurantCleanerIndex(prev => prev - 1);
    }
  };

  const updateHousekeeperName = (index: number, name: string) => {
    const newNames = [...housekeeperNames];
    newNames[index] = name;
    setHousekeeperNames(newNames);
  };

  const randomizeRestaurantCleaner = () => {
    const newIndex = Math.floor(Math.random() * housekeeperNames.length);
    setRestaurantCleanerIndex(newIndex);
  };

  const handleDistribute = () => {
    const result = distributeRooms(rooms, housekeeperNames, restaurantCleanerIndex);
    setAssignments(result);
    setIsDistributed(true);
  };

  const handleReset = () => {
    setIsDistributed(false);
    setAssignments([]);
  };

  const dirtyRoomsCount = useMemo(() => rooms.filter(r => r.isDirty).length, [rooms]);

  return (
    <div className="min-h-screen bg-[#F5F5F5] text-[#1A1A1A] font-sans p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-black rounded-lg">
                <Hotel className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs font-bold uppercase tracking-widest opacity-50">Gestión de Limpieza</span>
            </div>
            <h1 className="text-5xl font-light tracking-tight leading-none">
              Reparto de <span className="font-serif italic text-emerald-700">Habitaciones</span>
            </h1>
          </div>
          <div className="flex items-center gap-8">
            <div className="text-right">
              <div className="text-xs uppercase tracking-widest opacity-50 font-bold">Habitaciones Sucias</div>
              <div className="text-3xl font-mono text-red-500">{dirtyRoomsCount}</div>
            </div>
            <div className="text-right">
              <div className="text-xs uppercase tracking-widest opacity-50 font-bold">Total Hotel</div>
              <div className="text-3xl font-mono">{rooms.length}</div>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Configuration & Housekeepers */}
          <div className="lg:col-span-6 space-y-8">
            <div className="bg-white rounded-[32px] p-2 shadow-sm border border-black/5 flex gap-1">
              <button 
                onClick={() => setActiveTab('config')}
                className={`flex-1 py-3 rounded-2xl text-sm font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${activeTab === 'config' ? 'bg-black text-white shadow-lg' : 'hover:bg-gray-50 opacity-50'}`}
              >
                <Settings2 className="w-4 h-4" />
                Configuración
              </button>
              <button 
                onClick={() => setActiveTab('housekeepers')}
                className={`flex-1 py-3 rounded-2xl text-sm font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${activeTab === 'housekeepers' ? 'bg-black text-white shadow-lg' : 'hover:bg-gray-50 opacity-50'}`}
              >
                <Users className="w-4 h-4" />
                Camareras
              </button>
            </div>

            <AnimatePresence mode="wait">
              {activeTab === 'config' ? (
                <motion.section
                  key="config"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-white rounded-[40px] p-8 shadow-sm border border-black/5"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-medium flex items-center gap-2">
                      <Bed className="w-5 h-5 opacity-50" />
                      Mapa de Habitaciones
                    </h2>
                    <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest opacity-50">
                      <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500"></div> Sucia</div>
                      <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-gray-200"></div> Limpia</div>
                    </div>
                  </div>

                  <div className="space-y-8 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                    {[0, 1, 2].map(floor => (
                      <div key={floor} className="space-y-4">
                        <div className="flex items-center gap-2 border-b border-black/5 pb-2">
                          <Layers className="w-4 h-4 opacity-30" />
                          <h3 className="text-xs font-bold uppercase tracking-widest opacity-40">
                            {floor === 0 ? 'Planta Baja (2-17)' : floor === 1 ? 'Primer Piso (18-33)' : 'Segundo Piso (34-40)'}
                          </h3>
                        </div>
                        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
                          {rooms.filter(r => r.floor === floor).map((room) => (
                            <div key={room.number} className="relative">
                              <button
                                onClick={() => toggleRoomDirty(room.number)}
                                className={`w-full aspect-square rounded-2xl flex flex-col items-center justify-center transition-all border-2 ${
                                  room.isDirty 
                                    ? 'bg-red-50 border-red-200 text-red-700 shadow-sm' 
                                    : 'bg-gray-50 border-transparent text-gray-400 opacity-60'
                                }`}
                              >
                                <span className="text-lg font-mono font-bold">{room.number}</span>
                                <div 
                                  onClick={(e) => cycleRoomType(room.number, e)}
                                  className={`mt-1 px-1.5 py-0.5 rounded-md text-[7px] font-bold uppercase tracking-tighter transition-colors ${
                                    room.isDirty ? 'bg-red-100 text-red-600' : 'bg-gray-200 text-gray-500'
                                  }`}
                                >
                                  {room.type === 'matrimonial' ? 'Matr' : 
                                   room.type === 'triple' ? 'Trip' : 
                                   room.type === 'double' ? 'Dobl' : 
                                   room.type === 'quintuple' ? 'Quin' : 'Indi'}
                                </div>
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Type Summary */}
                  <div className="mt-6 flex flex-wrap gap-4 pt-6 border-t border-black/5">
                    {ROOM_TYPES.map(type => {
                      const count = rooms.filter(r => r.type === type).length;
                      return (
                        <div key={type} className="flex flex-col">
                          <span className="text-[8px] font-bold uppercase tracking-widest opacity-40">
                            {type === 'matrimonial' ? 'Matrimoniales' : 
                             type === 'triple' ? 'Triples' : 
                             type === 'double' ? 'Dobles' : 
                             type === 'quintuple' ? 'Quíntuples' : 'Individuales'}
                          </span>
                          <span className="text-sm font-mono font-bold">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="mt-8 p-4 bg-gray-50 rounded-2xl flex items-start gap-3">
                    <Info className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div className="text-xs text-gray-500 leading-relaxed">
                      <p>• Toca el <span className="font-bold">número</span> para marcar como sucia/limpia.</p>
                      <p>• Toca la <span className="font-bold">etiqueta de tipo</span> para cambiar la categoría.</p>
                      <p className="mt-2 text-[10px] opacity-70">Carga de trabajo (Camas): Matr/Indiv: 1, Doble: 2, Triple: 3, Quíntuple: 4, Restaurante: 2.</p>
                    </div>
                  </div>
                </motion.section>
              ) : (
                <motion.section
                  key="housekeepers"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-white rounded-[40px] p-8 shadow-sm border border-black/5"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-medium flex items-center gap-2">
                      <Users className="w-5 h-5 opacity-50" />
                      Personal de Limpieza
                    </h2>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={randomizeRestaurantCleaner}
                        className="p-3 hover:bg-gray-100 text-gray-500 rounded-full transition-colors"
                        title="Aleatorizar Restaurante"
                      >
                        <Shuffle className="w-6 h-6" />
                      </button>
                      <button 
                        onClick={addHousekeeper}
                        className="p-3 hover:bg-emerald-50 text-emerald-600 rounded-full transition-colors"
                      >
                        <Plus className="w-6 h-6" />
                      </button>
                    </div>
                  </div>
                  <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {housekeeperNames.map((name, index) => (
                      <div key={index} className="group flex items-center gap-3 p-3 rounded-2xl bg-gray-50 border border-transparent hover:border-emerald-200 transition-all">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white flex items-center justify-center text-xs font-bold border border-black/5">
                          {index + 1}
                        </div>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => updateHousekeeperName(index, e.target.value)}
                          className="flex-grow bg-transparent outline-none text-sm font-medium"
                        />
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setRestaurantCleanerIndex(index)}
                            className={`p-2 rounded-xl transition-colors ${restaurantCleanerIndex === index ? 'bg-emerald-100 text-emerald-700' : 'hover:bg-gray-200 text-gray-400'}`}
                            title="Asignar Restaurante"
                          >
                            <Utensils className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => removeHousekeeper(index)}
                            className="p-2 hover:bg-red-50 text-red-400 rounded-xl transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 p-4 bg-emerald-50 rounded-2xl flex items-start gap-3">
                    <Utensils className="w-5 h-5 text-emerald-600 mt-0.5" />
                    <p className="text-xs text-emerald-800 leading-relaxed">
                      La camarera asignada al <span className="font-bold">restaurante</span> recibirá automáticamente <span className="font-bold">2 habitaciones matrimoniales menos</span>.
                    </p>
                  </div>
                </motion.section>
              )}
            </AnimatePresence>

            {!isDistributed ? (
              <button
                onClick={handleDistribute}
                disabled={dirtyRoomsCount === 0}
                className="w-full py-5 bg-black text-white rounded-3xl font-bold tracking-widest uppercase text-sm hover:bg-emerald-600 disabled:opacity-30 disabled:hover:bg-black transition-all flex items-center justify-center gap-3 shadow-xl shadow-emerald-900/10"
              >
                Distribuir Habitaciones
                <ChevronRight className="w-5 h-5" />
              </button>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={handleDistribute}
                  className="flex-1 py-5 bg-emerald-600 text-white rounded-3xl font-bold tracking-widest uppercase text-sm hover:bg-emerald-700 transition-all flex items-center justify-center gap-3 shadow-lg"
                >
                  <Shuffle className="w-5 h-5" />
                  Barajar Reparto
                </button>
                <button
                  onClick={handleReset}
                  className="px-8 py-5 bg-white text-black border border-black/10 rounded-3xl font-bold tracking-widest uppercase text-sm hover:bg-gray-50 transition-all flex items-center justify-center gap-3"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          {/* Right Column: Results */}
          <div className="lg:col-span-6">
            <AnimatePresence mode="wait">
              {!isDistributed ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="h-full min-h-[500px] flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-black/10 rounded-[40px]"
                >
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                    <Brush className="w-10 h-10 text-gray-300" />
                  </div>
                  <h3 className="text-2xl font-medium mb-2">Plan de Trabajo</h3>
                  <p className="text-gray-500 max-w-xs mx-auto">
                    Selecciona las habitaciones sucias y configura el personal para generar las hojas de trabajo.
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="results"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between mb-2 px-4">
                    <h2 className="text-2xl font-medium">Hojas de Trabajo</h2>
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-emerald-600">
                      <CheckCircle2 className="w-4 h-4" />
                      Equilibrado por Camas
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-6">
                    {assignments.map((assignment, idx) => (
                      <motion.div
                        key={assignment.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className={`bg-white rounded-[40px] p-8 shadow-sm border ${assignment.isRestaurantCleaner ? 'border-emerald-200 bg-emerald-50/30' : 'border-black/5'}`}
                      >
                        <div className="flex items-start justify-between mb-8">
                          <div className="flex items-center gap-4">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${assignment.isRestaurantCleaner ? 'bg-emerald-600 text-white' : 'bg-black text-white'}`}>
                              {assignment.isRestaurantCleaner ? <Utensils className="w-7 h-7" /> : <User className="w-7 h-7" />}
                            </div>
                            <div>
                              <h3 className="text-2xl font-bold">{assignment.name}</h3>
                              <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full ${assignment.isRestaurantCleaner ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                                {assignment.isRestaurantCleaner ? 'Restaurante + Habitaciones' : 'Habitaciones'}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-6 text-right">
                            <div>
                              <div className="text-[10px] font-bold uppercase tracking-widest opacity-40">Camas</div>
                              <div className="text-4xl font-mono leading-none text-emerald-600">{assignment.totalBeds}</div>
                            </div>
                            <div>
                              <div className="text-[10px] font-bold uppercase tracking-widest opacity-40">Hab.</div>
                              <div className="text-4xl font-mono leading-none">{assignment.totalRooms}</div>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-8">
                          {assignment.assignedRooms.map(room => (
                            <div 
                              key={room.number} 
                              className={`px-4 py-2 rounded-xl flex flex-col items-center justify-center border ${
                                room.floor === 0 ? 'bg-white border-black/5' : 
                                room.floor === 1 ? 'bg-emerald-50 border-emerald-100' : 
                                'bg-gray-50 border-black/5'
                              }`}
                            >
                              <span className="text-lg font-mono font-bold leading-none">{room.number}</span>
                              <span className="text-[7px] uppercase font-bold opacity-40 mt-1">
                                {room.type === 'matrimonial' ? 'Matr' : 
                                 room.type === 'triple' ? 'Trip' : 
                                 room.type === 'double' ? 'Dobl' : 
                                 room.type === 'quintuple' ? 'Quin' : 'Indi'}
                              </span>
                            </div>
                          ))}
                        </div>

                        <div className="grid grid-cols-5 gap-2 pt-6 border-t border-black/5">
                          {(Object.entries(assignment.roomCounts) as [keyof RoomCounts, number][]).map(([type, count]) => (
                            <div key={type} className="text-center">
                              <div className="text-[8px] font-bold uppercase tracking-widest opacity-40 mb-1">
                                {type === 'matrimonial' ? 'Matr' : 
                                 type === 'triple' ? 'Trip' : 
                                 type === 'double' ? 'Dobl' : 
                                 type === 'quintuple' ? 'Quin' : 'Indi'}
                              </div>
                              <div className="text-sm font-mono font-bold">{count}</div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Summary Validation */}
                  <div className="p-8 bg-white rounded-[40px] border border-black/5 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                      <AlertCircle className="w-5 h-5 text-emerald-600" />
                      <h4 className="font-bold text-sm uppercase tracking-widest">Validación del Reparto</h4>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                      <div className="space-y-1">
                        <div className="text-[10px] font-bold uppercase tracking-widest opacity-40">Promedio Camas</div>
                        <div className="text-2xl font-mono">
                          {((dirtyRoomsCount > 0 ? assignments.reduce((acc, a) => acc + a.totalBeds, 0) : 0) / housekeeperNames.length).toFixed(1)}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-[10px] font-bold uppercase tracking-widest opacity-40">Dif. Carga</div>
                        <div className="text-2xl font-mono">
                          {Math.max(...assignments.map(a => a.totalBeds + (a.isRestaurantCleaner ? 2 : 0))) - 
                           Math.min(...assignments.map(a => a.totalBeds + (a.isRestaurantCleaner ? 2 : 0)))}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0,0,0,0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(0,0,0,0.2);
        }
      `}</style>
    </div>
  );
}
