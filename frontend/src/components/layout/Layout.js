'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import StatsCards from '@/components/dashboard/StatsCards';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/Card';
import { useDashboard } from '@/hooks/useDashboard';
import { RefreshCw, AlertTriangle, TrendingUp } from 'lucide-react';

export default function Dashboard() {
  const { data, loading, error, refetch } = useDashboard();

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Carregando dashboard...</span>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Erro ao carregar dashboard</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={refetch}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">Visão geral do seu estoque</p>
          </div>
          <button
            onClick={refetch}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </button>
        </div>

        {/* Stats Cards */}
        <StatsCards data={data} />

        {/* Charts and Tables Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Categorias */}
          <Card>
            <CardHeader>
              <CardTitle>Top Categorias</CardTitle>
            </CardHeader>
            <CardContent>
              {data?.top_categorias?.length > 0 ? (
                <div className="space-y-3">
                  {data.top_categorias.map((categoria, index) => (
                    <div key={categoria.nome} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div 
                          className="w-3 h-3 rounded-full mr-3"
                          style={{ backgroundColor: categoria.cor }}
                        />
                        <span className="font-medium text-gray-900">{categoria.nome}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-gray-900">
                          {categoria.total_produtos} produtos
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                          }).format(categoria.valor_estoque || 0)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">Nenhuma categoria encontrada</p>
              )}
            </CardContent>
          </Card>

          {/* Produtos Críticos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                Produtos com Estoque Crítico
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data?.produtos_criticos?.length > 0 ? (
                <div className="space-y-3">
                  {data.produtos_criticos.slice(0, 5).map((produto) => (
                    <div key={produto.id} className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">{produto.nome}</div>
                        <div className="text-sm text-gray-500">{produto.codigo}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-red-600">
                          {produto.estoque_atual} un
                        </div>
                        <div className="text-xs text-gray-500">
                          Min: {produto.estoque_minimo}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <TrendingUp className="h-12 w-12 text-green-500 mx-auto mb-2" />
                  <p className="text-gray-500">Todos os produtos com estoque OK!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Movimentações da Semana */}
        <Card>
          <CardHeader>
            <CardTitle>Movimentações dos Últimos 7 Dias</CardTitle>
          </CardHeader>
          <CardContent>
            {data?.movimentacoes_semana?.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 text-sm font-medium text-gray-500">Data</th>
                      <th className="text-left py-2 text-sm font-medium text-gray-500">Tipo</th>
                      <th className="text-right py-2 text-sm font-medium text-gray-500">Movimentações</th>
                      <th className="text-right py-2 text-sm font-medium text-gray-500">Quantidade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.movimentacoes_semana.map((mov, index) => (
                      <tr key={index} className="border-b border-gray-100">
                        <td className="py-2 text-sm text-gray-900">
                          {new Date(mov.data).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="py-2">
                          <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                            mov.tipo === 'entrada' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {mov.tipo === 'entrada' ? 'Entrada' : 'Saída'}
                          </span>
                        </td>
                        <td className="py-2 text-sm text-gray-900 text-right">{mov.total}</td>
                        <td className="py-2 text-sm text-gray-900 text-right">{mov.quantidade_total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">Nenhuma movimentação recente</p>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}