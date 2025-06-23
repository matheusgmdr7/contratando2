"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { TrendingUp, DollarSign, Calendar, Target } from "lucide-react"

const data = [
  { name: "Janeiro", comissao: 2400 },
  { name: "Fevereiro", comissao: 1398 },
  { name: "Março", comissao: 9800 },
  { name: "Abril", comissao: 3908 },
  { name: "Maio", comissao: 4800 },
  { name: "Junho", comissao: 3800 },
  { name: "Julho", comissao: 4300 },
]

const commissionData = [
  { id: 1, date: "2024-01-15", description: "Venda Imóvel A", value: 5000, status: "Pago" },
  { id: 2, date: "2024-02-20", description: "Venda Imóvel B", value: 7500, status: "Pago" },
  { id: 3, date: "2024-03-10", description: "Aluguel Imóvel C", value: 2000, status: "Pendente" },
  { id: 4, date: "2024-04-05", description: "Venda Imóvel D", value: 6000, status: "Pago" },
  { id: 5, date: "2024-05-12", description: "Aluguel Imóvel E", value: 1800, status: "Pendente" },
]

const ComissoesPage = () => {
  const totalComissao = commissionData.reduce((acc, item) => acc + item.value, 0)
  const comissaoPendente = commissionData
    .filter((item) => item.status === "Pendente")
    .reduce((acc, item) => acc + item.value, 0)
  const comissaoMedia = totalComissao / commissionData.length

  const getStatusColor = (status: string) => {
    return status === "Pago"
      ? "bg-green-100 text-green-800 hover:bg-green-200"
      : "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">Comissões</h1>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Comissão Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {totalComissao.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+20.1% em relação ao mês anterior</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Comissão Média</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {Math.round(comissaoMedia).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Por transação</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Comissão Pendente</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {comissaoPendente.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Aguardando pagamento</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Crescimento</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+12.5%</div>
            <p className="text-xs text-muted-foreground">Comparado ao mês anterior</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico Simples com Barras CSS */}
      <Card>
        <CardHeader>
          <CardTitle>Comissões Mensais</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.map((item, index) => (
              <div key={index} className="flex items-center space-x-4">
                <div className="w-20 text-sm font-medium">{item.name}</div>
                <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                  <div
                    className="bg-blue-600 h-6 rounded-full flex items-center justify-end pr-2"
                    style={{ width: `${(item.comissao / 10000) * 100}%` }}
                  >
                    <span className="text-white text-xs font-medium">R$ {item.comissao.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Detalhes */}
      <Card>
        <CardHeader>
          <CardTitle>Detalhes das Comissões</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Mobile Cards */}
          <div className="block md:hidden space-y-4">
            {commissionData.map((item) => (
              <Card key={item.id}>
                <CardContent className="pt-4 space-y-2">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <p className="font-medium">{item.description}</p>
                      <p className="text-sm text-gray-600">{item.date}</p>
                    </div>
                    <Badge className={getStatusColor(item.status)}>{item.status}</Badge>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold">R$ {item.value.toLocaleString()}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {commissionData.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.date}</TableCell>
                    <TableCell className="font-medium">{item.description}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(item.status)}>{item.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-bold">R$ {item.value.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default ComissoesPage
