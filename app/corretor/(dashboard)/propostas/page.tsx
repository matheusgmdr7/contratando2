"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, RefreshCw, MoreVertical, Eye } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const PropostasPage = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("")

  const propostas = [
    { id: 1, cliente: "João Silva", data: "2024-01-20", valor: 1500, status: "Em análise" },
    { id: 2, cliente: "Maria Souza", data: "2024-01-22", valor: 2200, status: "Aprovada" },
    { id: 3, cliente: "Carlos Pereira", data: "2024-01-25", valor: 1800, status: "Reprovada" },
    { id: 4, cliente: "Ana Oliveira", data: "2024-01-28", valor: 2500, status: "Em análise" },
    { id: 5, cliente: "Ricardo Santos", data: "2024-01-30", valor: 3000, status: "Aprovada" },
    { id: 6, cliente: "Isabela Costa", data: "2024-02-01", valor: 1200, status: "Reprovada" },
    { id: 7, cliente: "Fernando Lima", data: "2024-02-03", valor: 2000, status: "Em análise" },
    { id: 8, cliente: "Patricia Rocha", data: "2024-02-05", valor: 2800, status: "Aprovada" },
    { id: 9, cliente: "Gustavo Mendes", data: "2024-02-07", valor: 1600, status: "Reprovada" },
    { id: 10, cliente: "Juliana Nunes", data: "2024-02-10", valor: 2300, status: "Em análise" },
  ]

  const filteredPropostas = propostas.filter((proposta) => {
    const searchTermLower = searchTerm.toLowerCase()
    return (
      proposta.cliente.toLowerCase().includes(searchTermLower) &&
      (statusFilter === "" || proposta.status === statusFilter)
    )
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Aprovada":
        return "bg-green-100 text-green-800 hover:bg-green-200"
      case "Reprovada":
        return "bg-red-100 text-red-800 hover:bg-red-200"
      case "Em análise":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200"
    }
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">Propostas</h1>

        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full sm:w-64"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="Em análise">Em análise</SelectItem>
              <SelectItem value="Aprovada">Aprovada</SelectItem>
              <SelectItem value="Reprovada">Reprovada</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="icon">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="block md:hidden space-y-4">
        {filteredPropostas.map((proposta) => (
          <Card key={proposta.id}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{proposta.cliente}</CardTitle>
                <Badge className={getStatusColor(proposta.status)}>{proposta.status}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Data:</span>
                <span>{proposta.data}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Valor:</span>
                <span className="font-medium">R$ {proposta.valor.toLocaleString()}</span>
              </div>
              <div className="flex justify-end pt-2">
                <Button size="sm" variant="outline">
                  <Eye className="h-4 w-4 mr-2" />
                  Detalhes
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block">
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPropostas.map((proposta) => (
                <TableRow key={proposta.id}>
                  <TableCell className="font-medium">{proposta.cliente}</TableCell>
                  <TableCell>{proposta.data}</TableCell>
                  <TableCell>R$ {proposta.valor.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(proposta.status)}>{proposta.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="h-4 w-4 mr-2" />
                          Ver detalhes
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>

      {filteredPropostas.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500">Nenhuma proposta encontrada.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default PropostasPage
