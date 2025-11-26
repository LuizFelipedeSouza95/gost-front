import React, { useState } from 'react';
import { UserPlus, Send, CheckCircle } from 'lucide-react';
import { Card } from './ui/card';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { toast } from 'sonner';

export function RecruitmentSection() {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    idade: '',
    cidade: '',
    experiencia: '',
    equipamento: '',
    disponibilidade: '',
    motivacao: '',
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Simulação de envio
    console.log('Formulário enviado:', formData);
    setSubmitted(true);
    toast.success('Formulário enviado com sucesso! Entraremos em contato em breve.');

    // Reset form
    setTimeout(() => {
      setFormData({
        nome: '',
        email: '',
        telefone: '',
        idade: '',
        cidade: '',
        experiencia: '',
        equipamento: '',
        disponibilidade: '',
        motivacao: '',
      });
      setSubmitted(false);
    }, 3000);
  };

  const requirements = [
    'Ter no mínimo 18 anos de idade',
    'Possuir equipamento básico de airsoft (réplica, proteção, uniforme)',
    'Disponibilidade para participar de treinamentos aos domingos',
    'Comprometimento com fair play e segurança',
    'Respeito às regras e hierarquia da equipe',
    'Espírito de equipe e camaradagem',
  ];

  const recruitmentProcess = [
    {
      step: '1',
      title: 'Inscrição',
      description: 'Preencha o formulário de interesse com suas informações',
    },
    {
      step: '2',
      title: 'Avaliação',
      description: 'Análise do perfil e contato inicial da equipe',
    },
    {
      step: '3',
      title: 'Período Q&A',
      description: '3 semanas de participação em treinamentos e jogos',
    },
    {
      step: '4',
      title: 'Votação',
      description: 'Aprovação pelos membros permanentes (mínimo 50%)',
    },
    {
      step: '5',
      title: 'Integração',
      description: 'Boas-vindas oficial e uniforme GOST',
    },
  ];

  return (
    <div className="pt-24 pb-16 px-4 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-amber-600/20 rounded-full border-2 border-amber-500/50">
              <UserPlus className="w-12 h-12 text-amber-500" />
            </div>
          </div>
          <h1 className="text-4xl text-white mb-4">Recrutamento GOST</h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Junte-se à nossa equipe de elite e faça parte de operações táticas de alto nível
          </p>
        </div>

        {/* Requirements */}
        <Card className="p-8 bg-gray-800/50 backdrop-blur-sm border-amber-600/30 mb-8">
          <h2 className="text-2xl text-white mb-6">Requisitos Básicos</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {requirements.map((req, index) => (
              <div key={index} className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-1" />
                <p className="text-gray-300">{req}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Process */}
        <Card className="p-8 bg-gray-800/50 backdrop-blur-sm border-amber-600/30 mb-8">
          <h2 className="text-2xl text-white mb-6">Processo de Recrutamento</h2>
          <div className="grid md:grid-cols-5 gap-6">
            {recruitmentProcess.map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-12 h-12 bg-amber-600/20 border-2 border-amber-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-amber-500">{item.step}</span>
                </div>
                <h3 className="text-white mb-2">{item.title}</h3>
                <p className="text-sm text-gray-400">{item.description}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Form */}
        <Card className="p-8 bg-gray-800/50 backdrop-blur-sm border-amber-600/30">
          <h2 className="text-2xl text-white mb-6">Formulário de Interesse</h2>

          {submitted ? (
            <div className="text-center py-12">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-2xl text-white mb-2">Formulário Enviado!</h3>
              <p className="text-gray-400">
                Obrigado pelo seu interesse. Analisaremos sua inscrição e entraremos em contato em breve.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="nome" className="text-gray-300">Nome Completo *</Label>
                  <Input
                    id="nome"
                    name="nome"
                    value={formData.nome}
                    onChange={handleChange}
                    required
                    className="mt-2 bg-gray-900/50 border-gray-700 text-white"
                  />
                </div>

                <div>
                  <Label htmlFor="email" className="text-gray-300">Email *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="mt-2 bg-gray-900/50 border-gray-700 text-white"
                  />
                </div>

                <div>
                  <Label htmlFor="telefone" className="text-gray-300">Telefone *</Label>
                  <Input
                    id="telefone"
                    name="telefone"
                    type="tel"
                    value={formData.telefone}
                    onChange={handleChange}
                    required
                    className="mt-2 bg-gray-900/50 border-gray-700 text-white"
                  />
                </div>

                <div>
                  <Label htmlFor="idade" className="text-gray-300">Idade *</Label>
                  <Input
                    id="idade"
                    name="idade"
                    type="number"
                    value={formData.idade}
                    onChange={handleChange}
                    required
                    className="mt-2 bg-gray-900/50 border-gray-700 text-white"
                  />
                </div>

                <div>
                  <Label htmlFor="cidade" className="text-gray-300">Cidade *</Label>
                  <Input
                    id="cidade"
                    name="cidade"
                    value={formData.cidade}
                    onChange={handleChange}
                    required
                    className="mt-2 bg-gray-900/50 border-gray-700 text-white"
                  />
                </div>

                <div>
                  <Label htmlFor="experiencia" className="text-gray-300">Tempo de Experiência em Airsoft *</Label>
                  <Input
                    id="experiencia"
                    name="experiencia"
                    placeholder="Ex: 2 anos"
                    value={formData.experiencia}
                    onChange={handleChange}
                    required
                    className="mt-2 bg-gray-900/50 border-gray-700 text-white"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="equipamento" className="text-gray-300">Equipamento que Possui *</Label>
                <Textarea
                  id="equipamento"
                  name="equipamento"
                  value={formData.equipamento}
                  onChange={handleChange}
                  required
                  placeholder="Descreva seu equipamento (réplicas, proteção, uniforme, etc.)"
                  rows={3}
                  className="mt-2 bg-gray-900/50 border-gray-700 text-white"
                />
              </div>

              <div>
                <Label htmlFor="disponibilidade" className="text-gray-300">Disponibilidade *</Label>
                <Textarea
                  id="disponibilidade"
                  name="disponibilidade"
                  value={formData.disponibilidade}
                  onChange={handleChange}
                  required
                  placeholder="Quando você está disponível para treinar e jogar?"
                  rows={3}
                  className="mt-2 bg-gray-900/50 border-gray-700 text-white"
                />
              </div>

              <div>
                <Label htmlFor="motivacao" className="text-gray-300">Por que deseja entrar para o GOST? *</Label>
                <Textarea
                  id="motivacao"
                  name="motivacao"
                  value={formData.motivacao}
                  onChange={handleChange}
                  required
                  placeholder="Conte-nos sua motivação e o que espera da equipe"
                  rows={4}
                  className="mt-2 bg-gray-900/50 border-gray-700 text-white"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-amber-600 hover:bg-amber-700 text-white"
              >
                <Send className="w-4 h-4 mr-2" />
                Enviar Inscrição
              </Button>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}
