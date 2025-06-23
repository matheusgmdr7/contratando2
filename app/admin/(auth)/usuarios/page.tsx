"use client"

import { useState, useEffect } from "react"
import { PageHeader } from "@/components/admin/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, Edit, Trash2, UserPlus, Shield, ShieldAlert, Eye, Settings } from "lucide-react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  buscarUsuariosAdmin,
  criarUsuarioAdmin,
  atualizarUsuarioAdmin,
  excluirUsuarioAdmin,
  alterarStatusUsuarioAdmin,
  buscarPermissoesPerfil,
  type UsuarioAdmin,
  type CriarUsuarioAdmin,
  type PermissaoModulo,
} from "@/services/usuarios-admin-service"

const PERFIS = [
  { value: "master", label: "Master", description: "Acesso total ao sistema" },
  { value: "secretaria", label: "Secretaria", description: "Acesso operacional completo" },
  { value: "assistente", label: "Assistente", description: "Acesso limitado para consultas" },
]

const MODULOS_SISTEMA = [
  { key: "dashboard", label: "Dashboard", description: "Painel principal" },
  { key: "leads", label: "Leads", description: "Gerenciamento de leads" },
  { key: "propostas", label: "Propostas", description: "Propostas e contratos" },
  { key: "corretores", label: "Corretores", description: "Gestão de corretores" },
  { key: "produtos", label: "Produtos", description: "Produtos e tabelas" },
  { key: "tabelas", label: "Tabelas", description: "Tabelas de preços" },
  { key: "comissoes", label: "Comissões", description: "Controle de comissões" },
  { key: "usuarios", label: "Usuários", description: "Usuários administrativos" },
  { key: "contratos", label: "Contratos", description: "Contratos firmados" },
  { key: "vendas", label: "Vendas", description: "Relatórios de vendas" },
]

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<UsuarioAdmin[]>([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showPermissoesModal, setShowPermissoesModal] = useState(false)
  const [usuarioAtual, setUsuarioAtual] = useState<UsuarioAdmin | null>(null)
  const [permissoesPerfil, setPermissoesPerfil] = useState<PermissaoModulo[]>([])
  const [novoUsuario, setNovoUsuario] = useState<CriarUsuarioAdmin>({
    nome: "",
    email: "",
    senha: "",
    perfil: "assistente",
    permissoes_customizadas: {},
  })
  const [confirmarSenha, setConfirmarSenha] = useState("")

  useEffect(() => {
    carregarUsuarios()
  }, [])

  async function carregarUsuarios() {
    try {
      setLoading(true)
      const data = await buscarUsuariosAdmin()
      setUsuarios(data)
    } catch (error) {
      console.error("Erro ao carregar usuários:", error)
      toast.error("Erro ao carregar usuários")
    } finally {
      setLoading(false)
    }
  }

  async function carregarPermissoesPerfil(perfil: string) {
    try {
      const permissoes = await buscarPermissoesPerfil(perfil)
      setPermissoesPerfil(permissoes)
    } catch (error) {
      console.error("Erro ao carregar permissões:", error)
      toast.error("Erro ao carregar permissões do perfil")
    }
  }

  const usuariosFiltrados = usuarios.filter(
    (usuario) =>
      usuario.nome.toLowerCase().includes(filtro.toLowerCase()) ||
      usuario.email.toLowerCase().includes(filtro.toLowerCase()),
  )

  const handleSalvarUsuario = async () => {
    try {
      if (novoUsuario.senha !== confirmarSenha) {
        toast.error("As senhas não coincidem")
        return
      }

      if (!novoUsuario.nome || !novoUsuario.email || (!usuarioAtual && !novoUsuario.senha)) {
        toast.error("Preencha todos os campos obrigatórios")
        return
      }

      // Simular ID do usuário logado (você deve pegar do contexto de autenticação)
      const usuarioLogadoId = "current-user-id"

      if (usuarioAtual) {
        // Atualizar usuário existente
        await atualizarUsuarioAdmin(usuarioAtual.id, novoUsuario, usuarioLogadoId)
        toast.success("Usuário atualizado com sucesso")
      } else {
        // Criar novo usuário
        await criarUsuarioAdmin(novoUsuario, usuarioLogadoId)
        toast.success("Usuário criado com sucesso")
      }

      setShowModal(false)
      resetForm()
      carregarUsuarios()
    } catch (error: any) {
      console.error("Erro ao salvar usuário:", error)
      toast.error(error.message || "Erro ao salvar usuário")
    }
  }

  const handleExcluirUsuario = async () => {
    try {
      if (!usuarioAtual) return

      const usuarioLogadoId = "current-user-id"
      await excluirUsuarioAdmin(usuarioAtual.id, usuarioLogadoId)
      toast.success("Usuário excluído com sucesso")
      setShowDeleteDialog(false)
      carregarUsuarios()
    } catch (error: any) {
      console.error("Erro ao excluir usuário:", error)
      toast.error(error.message || "Erro ao excluir usuário")
    }
  }

  const handleEditarUsuario = (usuario: UsuarioAdmin) => {
    setUsuarioAtual(usuario)
    setNovoUsuario({
      nome: usuario.nome,
      email: usuario.email,
      senha: "",
      perfil: usuario.perfil,
      permissoes_customizadas: usuario.permissoes || {},
    })
    setConfirmarSenha("")
    setShowModal(true)
  }

  const handleAlterarStatus = async (usuario: UsuarioAdmin) => {
    try {
      const novoStatus = usuario.status === "ativo" ? "inativo" : "ativo"
      const usuarioLogadoId = "current-user-id"
      await alterarStatusUsuarioAdmin(usuario.id, novoStatus, usuarioLogadoId)
      toast.success(`Usuário ${novoStatus === "ativo" ? "ativado" : "desativado"} com sucesso`)
      carregarUsuarios()
    } catch (error: any) {
      console.error("Erro ao alterar status do usuário:", error)
      toast.error(error.message || "Erro ao alterar status do usuário")
    }
  }

  const handleVisualizarPermissoes = async (usuario: UsuarioAdmin) => {
    setUsuarioAtual(usuario)
    await carregarPermissoesPerfil(usuario.perfil)
    setShowPermissoesModal(true)
  }

  const resetForm = () => {
    setUsuarioAtual(null)
    setNovoUsuario({
      nome: "",
      email: "",
      senha: "",
      perfil: "assistente",
      permissoes_customizadas: {},
    })
    setConfirmarSenha("")
  }

  const getPerfilBadge = (perfil: string) => {
    switch (perfil) {
      case "master":
        return (
          <Badge variant="destructive" className="bg-red-100 text-red-800 hover:bg-red-100">
            <ShieldAlert className="h-3 w-3 mr-1" />
            Master
          </Badge>
        )
      case "secretaria":
        return (
          <Badge variant="default" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            <Shield className="h-3 w-3 mr-1" />
            Secretaria
          </Badge>
        )
      case "assistente":
        return (
          <Badge variant="secondary" className="bg-gray-100 text-gray-800 hover:bg-gray-100">
            <Settings className="h-3 w-3 mr-1" />
            Assistente
          </Badge>
        )
      default:
        return <Badge variant="outline">{perfil}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Usuários Administrativos"
        description="Gerencie os usuários do sistema administrativo e suas permissões"
        actions={
          <Button
            onClick={() => {
              resetForm()
              setShowModal(true)
            }}
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Novo Usuário
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <CardTitle>Lista de Usuários</CardTitle>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Buscar por nome ou email..."
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Spinner />
            </div>
          ) : usuariosFiltrados.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Perfil</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Último Acesso</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usuariosFiltrados.map((usuario) => (
                    <TableRow key={usuario.id}>
                      <TableCell className="font-medium">{usuario.nome}</TableCell>
                      <TableCell>{usuario.email}</TableCell>
                      <TableCell>{getPerfilBadge(usuario.perfil)}</TableCell>
                      <TableCell>
                        <Badge
                          variant={usuario.status === "ativo" ? "success" : "outline"}
                          className={`${
                            usuario.status === "ativo"
                              ? "bg-green-100 text-green-800 hover:bg-green-100"
                              : "bg-gray-100 text-gray-800 hover:bg-gray-100"
                          }`}
                        >
                          {usuario.status === "ativo" ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {usuario.ultimo_acesso ? new Date(usuario.ultimo_acesso).toLocaleString() : "Nunca acessou"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleVisualizarPermissoes(usuario)}
                            title="Ver permissões"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleEditarUsuario(usuario)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleAlterarStatus(usuario)}>
                            {usuario.status === "ativo" ? "Desativar" : "Ativar"}
                          </Button>
                          {usuario.perfil !== "master" && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => {
                                setUsuarioAtual(usuario)
                                setShowDeleteDialog(true)
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">Nenhum usuário encontrado</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal para criar/editar usuário */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{usuarioAtual ? "Editar Usuário" : "Novo Usuário"}</DialogTitle>
            <DialogDescription>
              {usuarioAtual ? "Edite as informações do usuário" : "Preencha as informações para criar um novo usuário"}
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="dados" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="dados">Dados Básicos</TabsTrigger>
              <TabsTrigger value="permissoes">Permissões</TabsTrigger>
            </TabsList>

            <TabsContent value="dados" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome Completo</Label>
                <Input
                  id="nome"
                  placeholder="Nome completo do usuário"
                  value={novoUsuario.nome}
                  onChange={(e) => setNovoUsuario({ ...novoUsuario, nome: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@exemplo.com"
                  value={novoUsuario.email}
                  onChange={(e) => setNovoUsuario({ ...novoUsuario, email: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="perfil">Perfil de Acesso</Label>
                <Select
                  value={novoUsuario.perfil}
                  onValueChange={(value: any) => setNovoUsuario({ ...novoUsuario, perfil: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o perfil" />
                  </SelectTrigger>
                  <SelectContent>
                    {PERFIS.map((perfil) => (
                      <SelectItem key={perfil.value} value={perfil.value}>
                        <div className="flex flex-col">
                          <span className="font-medium">{perfil.label}</span>
                          <span className="text-sm text-gray-500">{perfil.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="senha">Senha {usuarioAtual && "(deixe em branco para manter a atual)"}</Label>
                  <Input
                    id="senha"
                    type="password"
                    placeholder="********"
                    value={novoUsuario.senha}
                    onChange={(e) => setNovoUsuario({ ...novoUsuario, senha: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmarSenha">Confirmar Senha</Label>
                  <Input
                    id="confirmarSenha"
                    type="password"
                    placeholder="********"
                    value={confirmarSenha}
                    onChange={(e) => setConfirmarSenha(e.target.value)}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="permissoes" className="space-y-4">
              <div className="text-sm text-gray-600 mb-4">
                As permissões são definidas automaticamente pelo perfil selecionado. Você pode personalizar permissões
                específicas abaixo.
              </div>

              <div className="space-y-4">
                {MODULOS_SISTEMA.map((modulo) => (
                  <div key={modulo.key} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="font-medium">{modulo.label}</h4>
                        <p className="text-sm text-gray-500">{modulo.description}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <Checkbox id={`${modulo.key}-visualizar`} />
                        <Label htmlFor={`${modulo.key}-visualizar`}>Visualizar</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id={`${modulo.key}-criar`} />
                        <Label htmlFor={`${modulo.key}-criar`}>Criar</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id={`${modulo.key}-editar`} />
                        <Label htmlFor={`${modulo.key}-editar`}>Editar</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id={`${modulo.key}-excluir`} />
                        <Label htmlFor={`${modulo.key}-excluir`}>Excluir</Label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSalvarUsuario}>{usuarioAtual ? "Salvar Alterações" : "Criar Usuário"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de visualização de permissões */}
      <Dialog open={showPermissoesModal} onOpenChange={setShowPermissoesModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Permissões do Usuário</DialogTitle>
            <DialogDescription>
              Permissões de {usuarioAtual?.nome} - Perfil: {usuarioAtual?.perfil}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {permissoesPerfil.map((permissao) => (
              <div key={permissao.modulo} className="border rounded-lg p-3">
                <h4 className="font-medium capitalize mb-2">{permissao.modulo}</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {Object.entries(permissao.permissoes).map(([acao, permitido]) => (
                    <div key={acao} className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${permitido ? "bg-green-500" : "bg-red-500"}`}></div>
                      <span className="capitalize">{acao}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPermissoesModal(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmação para excluir usuário */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Usuário</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o usuário {usuarioAtual?.nome}? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleExcluirUsuario} className="bg-red-600 hover:bg-red-700">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
