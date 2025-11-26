import { useState } from 'react';
import { PestControlForm } from '../components/forms/PestControlForm';
import { FertilizationForm } from '../components/forms/FertilizationForm';
import { CulturalForm } from '../components/forms/CulturalForm';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export function Field() {
  const [activeAction, setActiveAction] = useState<'none' | 'pest' | 'fertilization' | 'cultural'>('none');
  const activities = useLiveQuery(() => db.activities.orderBy('date').reverse().limit(10).toArray());
  const farms = useLiveQuery(() => db.farms.toArray());
  const lots = useLiveQuery(() => db.lots.toArray());

  const getLotName = (lotId: number) => {
    const lot = lots?.find(l => l.id === lotId);
    const farm = farms?.find(f => f.id === lot?.farmId);
    return `${lot?.name || 'Lote desconocido'} (${farm?.name || 'Finca desconocida'})`;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Gestión de Campo</h2>
        {activeAction !== 'none' && (
          <button
            onClick={() => setActiveAction('none')}
            className="text-sm text-gray-600 hover:text-gray-900 underline"
          >
            Volver
          </button>
        )}
      </div>

      {activeAction === 'none' && (
        <div className="grid grid-cols-1 gap-4">
          <button
            onClick={() => setActiveAction('pest')}
            className="bg-green-600 text-white p-4 rounded-lg shadow hover:bg-green-700 transition flex items-center justify-center"
          >
            <span className="font-semibold">Registrar Plagas / Enfermedades</span>
          </button>
          <button
            onClick={() => setActiveAction('fertilization')}
            className="bg-blue-600 text-white p-4 rounded-lg shadow hover:bg-blue-700 transition flex items-center justify-center"
          >
            <span className="font-semibold">Registrar Fertilización</span>
          </button>
          <button
            onClick={() => setActiveAction('cultural')}
            className="bg-amber-600 text-white p-4 rounded-lg shadow hover:bg-amber-700 transition flex items-center justify-center"
          >
            <span className="font-semibold">Labores Culturales</span>
          </button>
        </div>
      )}

      {activeAction === 'pest' && (
        <PestControlForm onSuccess={() => setActiveAction('none')} />
      )}

      {activeAction === 'fertilization' && (
        <FertilizationForm onSuccess={() => setActiveAction('none')} />
      )}

      {activeAction === 'cultural' && (
        <CulturalForm onSuccess={() => setActiveAction('none')} />
      )}

      {activeAction === 'none' && (
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Actividades Recientes</h3>
          {!activities?.length && <p className="text-gray-500">No hay actividades registradas.</p>}
          <ul className="space-y-3">
            {activities?.map(activity => (
              <li key={activity.id} className="border-b pb-2 last:border-0">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-medium text-gray-800">
                      {activity.type === 'pest_control' ? 'Control Sanitario' :
                        activity.type === 'fertilization' ? 'Fertilización' :
                          activity.type === 'pruning' ? 'Labor Cultural' : activity.type}
                    </span>
                    <p className="text-sm text-gray-600">{getLotName(activity.lotId)}</p>
                    <p className="text-xs text-gray-500">
                      {activity.type === 'pest_control' && (
                        `${activity.details.subtype === 'pest' ? 'Plaga' : activity.details.subtype === 'disease' ? 'Enfermedad' : 'Maleza'}: ${activity.details.name} (${activity.details.severity})`
                      )}
                      {activity.type === 'fertilization' && (
                        `${activity.details.inputName} - ${activity.details.dose} ${activity.details.unit}`
                      )}
                      {activity.type === 'pruning' && (
                        `${activity.details.activityName} (${activity.details.method})`
                      )}
                    </p>
                  </div>
                  <span className="text-xs text-gray-500">
                    {format(new Date(activity.date), 'dd MMM yyyy', { locale: es })}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
