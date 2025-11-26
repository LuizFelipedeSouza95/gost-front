import React from 'react';
import { Play, Book, Video, Target } from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
// import { ImageWithFallback } from './figma/ImageWithFallback';

export function TreinamentoSection() {
  // Classes compartilhadas para os botões de tab
  const tabTriggerClasses = "w-full sm:w-auto text-white bg-transparent text-sm sm:text-base font-medium data-[state=active]:text-black data-[state=active]:bg-white data-[state=active]:border-white/20 data-[state=active]:shadow-md border border-transparent flex-1 sm:flex-none transition-all duration-200 ease-in-out rounded-lg sm:rounded-xl px-4 sm:px-6 py-2.5 sm:py-3 hover:text-white hover:bg-gray-700/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-800 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed";

  const videos = [
    { title: 'Táticas CQB Básicas', duration: '15:30', level: 'Iniciante', views: 234 },
    { title: 'Comunicação em Campo', duration: '12:45', level: 'Iniciante', views: 189 },
    { title: 'Movimento Tático Avançado', duration: '20:15', level: 'Avançado', views: 156 },
    { title: 'Trabalho em Equipe', duration: '18:00', level: 'Intermediário', views: 201 },
  ];

  const exercises = [
    { name: 'Cardio Resistência', description: 'Corrida 5km, 3x por semana', difficulty: 'Médio' },
    { name: 'Força Core', description: 'Prancha, abdominais, 4x semana', difficulty: 'Médio' },
    { name: 'Agilidade', description: 'Drills de movimento lateral', difficulty: 'Alto' },
  ];

  const maintenance = [
    { task: 'Limpeza do Cano', frequency: 'Após cada uso', importance: 'Alta' },
    { task: 'Lubrificação Gearbox', frequency: 'Mensal', importance: 'Alta' },
    { task: 'Verificação Hop-up', frequency: 'Quinzenal', importance: 'Média' },
  ];

  return (
    <div className="pt-24 pb-16 px-4 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl text-white mb-4">Área de Treinamento</h1>
          <p className="text-gray-400">Tutoriais, exercícios e manutenção</p>
        </div>

        <Tabs defaultValue="videos" className="space-y-8">
          <div className="w-full max-w-2xl mx-auto border-2 border-amber-600/30 rounded-xl p-2 sm:p-2 bg-gray-800/80 backdrop-blur-sm shadow-lg">
            <TabsList className="flex flex-col sm:flex-row w-full gap-2 sm:gap-3 h-auto bg-transparent border-0">
              <TabsTrigger value="videos" className={tabTriggerClasses}>
                Vídeos
              </TabsTrigger>
              <TabsTrigger value="fitness" className={tabTriggerClasses}>
                Preparação Física
              </TabsTrigger>
              <TabsTrigger value="maintenance" className={tabTriggerClasses}>
                Manutenção
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="videos">
            <div className="grid md:grid-cols-2 gap-6">
              {videos.map((video, i) => (
                <Card key={i} className="overflow-hidden bg-gray-800/50 border-amber-600/30">
                  <div className="aspect-video bg-gray-900 relative flex items-center justify-center">
                    {/* <ImageWithFallback
                      src="https://images.unsplash.com/photo-1561449805-b12504b2bd9e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaWxpdGFyeSUyMHRyYWluaW5nJTIwY291cnNlfGVufDF8fHx8MTc2MzQ2NzIzMnww&ixlib=rb-4.1.0&q=80&w=1080"
                      alt={video.title}
                      className="w-full h-full object-cover opacity-50"
                    /> */}
                    <Play className="w-16 h-16 text-amber-500 absolute" />
                  </div>
                  <div className="p-4">
                    <h3 className="text-white mb-3 break-words">{video.title}</h3>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 text-sm">
                      <span className="text-gray-300">{video.duration}</span>
                      <Badge className="bg-blue-600/20 text-blue-400 border-blue-500/50 text-xs w-fit">
                        {video.level}
                      </Badge>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="fitness">
            <Card className="p-6 bg-gray-800/50 border-amber-600/30">
              <h2 className="text-2xl text-white mb-6">Programa de Condicionamento</h2>
              <div className="space-y-4">
                {exercises.map((ex, i) => (
                  <div key={i} className="p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-3">
                      <h3 className="text-white break-words">{ex.name}</h3>
                      <Badge className={`text-xs w-fit ${ex.difficulty === 'Alto' ? 'bg-red-600/20 text-red-400 border-red-500/50' :
                        ex.difficulty === 'Médio' ? 'bg-yellow-600/20 text-yellow-400 border-yellow-500/50' :
                          'bg-green-600/20 text-green-400 border-green-500/50'
                        }`}>
                        {ex.difficulty}
                      </Badge>
                    </div>
                    <p className="text-gray-300 text-sm break-words">{ex.description}</p>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="maintenance">
            <Card className="p-6 bg-gray-800/50 border-amber-600/30">
              <h2 className="text-2xl text-white mb-6">Checklist de Manutenção</h2>
              <div className="space-y-3">
                {maintenance.map((item, i) => (
                  <div key={i} className="p-4 bg-gray-900/50 rounded-lg border border-gray-700 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white mb-2 break-words">{item.task}</h3>
                      <p className="text-sm text-gray-300 break-words">{item.frequency}</p>
                    </div>
                    <Badge className={`w-fit shrink-0 ${item.importance === 'Alta' ? 'bg-red-600/20 text-red-400 border-red-500/50' :
                      'bg-yellow-600/20 text-yellow-400 border-yellow-500/50'
                      }`}>
                      {item.importance}
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
