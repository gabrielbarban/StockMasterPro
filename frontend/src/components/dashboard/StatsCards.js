import { 
  Package, 
  AlertTriangle, 
  DollarSign, 
  Users, 
  Tags, 
  TrendingUp,
  Percent
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';

const StatCard = ({ title, value, icon: Icon, color = "blue", subtitle, trend }) => {
  const colorClasses = {
    blue: "bg-blue-500 text-blue-600 bg-blue-50",
    red: "bg-red-500 text-red-600 bg-red-50",
    green: "bg-green-500 text-green-600 bg-green-50",
    yellow: "bg-yellow-500 text-yellow-600 bg-yellow-50",
    purple: "bg-purple-500 text-purple-600 bg-purple-50",
  };

  const [bgColor, textColor, lightBg] = colorClasses[color].split(' ');

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center">
          <div className={`${lightBg} p-3 rounded-lg`}>
            <Icon className={`h-6 w-6 ${textColor}`} />
          </div>
          <div className="ml-4 flex-1">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <div className="flex items-center">
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              {trend && (
                <span className={`ml-2 text-sm ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {trend > 0 ? '+' : ''}{trend}%
                </span>
              )}
            </div>
            {subtitle && (
              <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default function StatsCards({ data }) {
  if (!data) return null;

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value || 0);
  };

  const formatNumber = (value) => {
    return new Intl.NumberFormat('pt-BR').format(value || 0);
  };

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total de Produtos"
        value={formatNumber(data.resumo?.total_produtos)}
        icon={Package}
        color="blue"
        subtitle="Produtos ativos"
      />
      
      <StatCard
        title="Estoque Baixo"
        value={formatNumber(data.resumo?.produtos_baixo_estoque)}
        icon={AlertTriangle}
        color="red"
        subtitle="Necessitam reposição"
      />
      
      <StatCard
        title="Valor do Estoque"
        value={formatCurrency(data.resumo?.valor_total_estoque)}
        icon={DollarSign}
        color="green"
        subtitle="Valor total investido"
      />
      
      <StatCard
        title="Fornecedores Ativos"
        value={formatNumber(data.resumo?.total_fornecedores)}
        icon={Users}
        color="purple"
        subtitle="Fornecedores cadastrados"
      />
      
      <StatCard
        title="Categorias"
        value={formatNumber(data.resumo?.total_categorias)}
        icon={Tags}
        color="yellow"
        subtitle="Categorias ativas"
      />
      
      <StatCard
        title="Movimentações Hoje"
        value={formatNumber(data.resumo?.movimentacoes_hoje)}
        icon={TrendingUp}
        color="blue"
        subtitle="Entradas e saídas"
      />
      
      <StatCard
        title="Margem Média"
        value={`${(data.resumo?.margem_media || 0).toFixed(1)}%`}
        icon={Percent}
        color="green"
        subtitle="Lucro médio dos produtos"
      />
    </div>
  );
}