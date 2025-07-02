'use client';

import { useState, useEffect } from 'react';
import { api, UsuarioDTO, fetchRanking } from '@/api'; // Removido EstatisticasDTO
import Link from 'next/link';

export default function EstatisticasPage() {
  const [usuario, setUsuario] = useState<UsuarioDTO | null>(null);
  const [ranking, setRanking] = useState<UsuarioDTO[]>([]); // Estado para o ranking
  const [login, setLogin] = useState('');
  const [loadingUsuario, setLoadingUsuario] = useState(false);
  const [loadingRanking, setLoadingRanking] = useState(true); // Estado de loading para o ranking
  const [errorUsuario, setErrorUsuario] = useState<string | null>(null);
  const [errorRanking, setErrorRanking] = useState<string | null>(null); // Estado de erro para o ranking

  useEffect(() => {
    const fetchRankingData = async () => {
      try {
        setLoadingRanking(true);
        const rankingData = await fetchRanking();
        // Ordena o ranking pela taxa de sucesso (maior primeiro)
        const sortedRanking = rankingData.sort((a, b) => b.taxaSucesso - a.taxaSucesso);
        setRanking(sortedRanking);
        setErrorRanking(null);
      } catch (error) {
        console.error('Erro ao buscar o ranking:', error);
        setErrorRanking('Não foi possível carregar o ranking de usuários.');
      } finally {
        setLoadingRanking(false);
      }
    };

    fetchRankingData();
  }, []);

  const handleBuscarUsuario = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!login) return;

    try {
      setLoadingUsuario(true);
      setErrorUsuario(null);
      setUsuario(null);
      const response = await api.get(`/usuarios/${login}/estatisticas`);
      setUsuario(response.data);
    } catch (error) {
      console.error(`Erro ao buscar estatísticas para o usuário ${login}:`, error);
      setErrorUsuario(`Usuário "${login}" não encontrado ou erro na busca.`);
      setUsuario(null);
    } finally {
      setLoadingUsuario(false);
    }
  };

  return (
    <div className="container mx-auto p-8 bg-gray-900 text-white min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-blue-400">Página de Estatísticas</h1>
        <Link href="/simulation" className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors">
          Voltar para Simulação
        </Link>
      </div>

      {/* Ranking de Usuários */}
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-8">
        <h2 className="text-2xl font-semibold mb-4 border-b-2 border-blue-500 pb-2">Ranking de Jogadores (Taxa de Sucesso)</h2>
        {loadingRanking && <p className="text-center">Carregando ranking...</p>}
        {errorRanking && <p className="text-center text-red-500">{errorRanking}</p>}
        {ranking.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left table-auto">
              <thead>
                <tr className="bg-gray-700">
                  <th className="p-3 font-semibold">Posição</th>
                  <th className="p-3 font-semibold">Usuário</th>
                  <th className="p-3 font-semibold">Pontuação</th>
                  <th className="p-3 font-semibold">Nº de Simulações</th>
                  <th className="p-3 font-semibold">Taxa de Sucesso</th>
                </tr>
              </thead>
              <tbody>
                {ranking.map((user, index) => (
                  <tr key={user.login} className="border-b border-gray-700 hover:bg-gray-600 transition-colors">
                    <td className="p-3">{index + 1}º</td>
                    <td className="p-3 font-medium text-green-400">@{user.login}</td>
                    <td className="p-3">{user.pontuacao ?? 'N/A'}</td>
                    <td className="p-3">{user.totalSimulacoes ?? 'N/A'}</td>
                    <td className="p-3 font-bold text-yellow-400">{typeof user.taxaSucesso === 'number' ? `${(user.taxaSucesso * 100).toFixed(2)}%` : 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!loadingRanking && ranking.length === 0 && !errorRanking && (
          <p className="text-center">Nenhum usuário no ranking ainda.</p>
        )}
      </div>

      {/* Estatísticas por Usuário */}
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold mb-4 border-b-2 border-blue-500 pb-2">Estatísticas por Usuário</h2>
        <form onSubmit={handleBuscarUsuario} className="flex gap-4 mb-6">
          <input
            type="text"
            value={login}
            onChange={(e) => setLogin(e.target.value)}
            placeholder="Digite o login do usuário"
            className="flex-grow p-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={loadingUsuario}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-500"
          >
            {loadingUsuario ? 'Buscando...' : 'Buscar'}
          </button>
        </form>

        {loadingUsuario && <p className="text-center">Carregando estatísticas do usuário...</p>}
        {errorUsuario && <p className="text-center text-red-500">{errorUsuario}</p>}
        
        {usuario && (
          <div className="bg-gray-700 p-6 rounded-lg">
            <h3 className="text-xl font-bold mb-4 text-green-400">Estatísticas de @{usuario.login}</h3>
            <div className="flex items-center gap-6">
              {usuario.avatar && (
                <img 
                  src={usuario.avatar} 
                  alt={`Avatar de ${usuario.login}`}
                  className="w-24 h-24 rounded-full object-cover border-4 border-blue-400"
                  onError={(e) => (e.currentTarget.style.display = 'none')} // Oculta se a imagem não carregar
                />
              )}
              <div className="grid grid-cols-1 gap-2">
                <p><strong>Pontuação:</strong> {usuario.pontuacao ?? 'N/A'}</p>
                <p><strong>Total de Simulações:</strong> {usuario.totalSimulacoes ?? 'N/A'}</p>
                <p><strong>Taxa de Sucesso:</strong> {typeof usuario.taxaSucesso === 'number' ? `${(usuario.taxaSucesso * 100).toFixed(2)}%` : 'N/A'}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
