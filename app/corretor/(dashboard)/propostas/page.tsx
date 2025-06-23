"use client"

import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  useMediaQuery,
  createTheme,
  ThemeProvider,
  Card,
  CardContent,
  Typography,
  IconButton,
} from "@mui/material"
import SearchIcon from "@mui/icons-material/Search"
import RefreshIcon from "@mui/icons-material/Refresh"
import MoreVertIcon from "@mui/icons-material/MoreVert"

const theme = createTheme({
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1280,
      xl: 1920,
    },
  },
})

const PropostasPage = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))

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

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ p: 3 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            justifyContent: "space-between",
            alignItems: isMobile ? "flex-start" : "center",
            mb: 2,
          }}
        >
          <TextField
            label="Buscar Cliente"
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ mb: isMobile ? 2 : 0, width: isMobile ? "100%" : "auto" }}
          />
          <Box sx={{ display: "flex", flexDirection: isMobile ? "column" : "row", alignItems: "center" }}>
            <FormControl sx={{ m: isMobile ? 1 : 0, minWidth: 120, mb: isMobile ? 2 : 0 }}>
              <InputLabel id="status-filter-label">Status</InputLabel>
              <Select
                labelId="status-filter-label"
                id="status-filter"
                value={statusFilter}
                label="Status"
                onChange={(e) => setStatusFilter(e.target.value)}
                size="small"
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="Em análise">Em análise</MenuItem>
                <MenuItem value="Aprovada">Aprovada</MenuItem>
                <MenuItem value="Reprovada">Reprovada</MenuItem>
              </Select>
            </FormControl>
            <Button variant="outlined" startIcon={<SearchIcon />} sx={{ ml: isMobile ? 0 : 1, mb: isMobile ? 2 : 0 }}>
              Buscar
            </Button>
            <IconButton aria-label="refresh">
              <RefreshIcon />
            </IconButton>
          </Box>
        </Box>

        {isMobile ? (
          <Box>
            {filteredPropostas.map((proposta) => (
              <Card key={proposta.id} sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="h6" component="div">
                    {proposta.cliente}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Data: {proposta.data}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Valor: R$ {proposta.valor}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Status: {proposta.status}
                  </Typography>
                  <Box mt={1} display="flex" justifyContent="flex-end">
                    <Button size="small" variant="contained">
                      Detalhes
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        ) : (
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell>Cliente</TableCell>
                  <TableCell>Data</TableCell>
                  <TableCell>Valor</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredPropostas.map((proposta) => (
                  <TableRow key={proposta.id}>
                    <TableCell component="th" scope="row">
                      {proposta.cliente}
                    </TableCell>
                    <TableCell>{proposta.data}</TableCell>
                    <TableCell>R$ {proposta.valor}</TableCell>
                    <TableCell>{proposta.status}</TableCell>
                    <TableCell align="right">
                      <IconButton aria-label="more">
                        <MoreVertIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
    </ThemeProvider>
  )
}

export default PropostasPage
