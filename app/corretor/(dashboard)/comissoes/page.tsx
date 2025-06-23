"use client"
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  useMediaQuery,
  useTheme,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  styled,
} from "@mui/material"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.MuiTableCell-head`]: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  [`&.MuiTableCell-body`]: {
    fontSize: 14,
  },
}))

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: theme.palette.action.hover,
  },
  // hide last border
  "&:last-child td, &:last-child th": {
    border: 0,
  },
}))

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
  { id: 1, date: "2024-01-15", description: "Venda Imóvel A", value: 5000 },
  { id: 2, date: "2024-02-20", description: "Venda Imóvel B", value: 7500 },
  { id: 3, date: "2024-03-10", description: "Aluguel Imóvel C", value: 2000 },
  { id: 4, date: "2024-04-05", description: "Venda Imóvel D", value: 6000 },
  { id: 5, date: "2024-05-12", description: "Aluguel Imóvel E", value: 1800 },
]

const ComissoesPage = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" gutterBottom>
        Comissões
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" component="div">
                Comissão Total
              </Typography>
              <Typography variant="h5">R$ 25.000,00</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" component="div">
                Comissão Média
              </Typography>
              <Typography variant="h5">R$ 4.166,67</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" component="div">
                Comissão Pendente
              </Typography>
              <Typography variant="h5">R$ 3.000,00</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box mt={4}>
        <Typography variant="h6" gutterBottom>
          Gráfico de Comissões Mensais
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="comissao" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </Box>

      <Box mt={4}>
        <Typography variant="h6" gutterBottom>
          Detalhes das Comissões
        </Typography>
        <Paper sx={{ width: "100%", overflow: "hidden" }}>
          <TableContainer sx={{ maxHeight: 440 }}>
            <Table stickyHeader aria-label="sticky table">
              <TableHead>
                <TableRow>
                  <StyledTableCell>Data</StyledTableCell>
                  <StyledTableCell>Descrição</StyledTableCell>
                  <StyledTableCell>Valor</StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {commissionData.map((row) => (
                  <StyledTableRow key={row.id}>
                    <StyledTableCell component="th" scope="row">
                      {row.date}
                    </StyledTableCell>
                    <StyledTableCell>{row.description}</StyledTableCell>
                    <StyledTableCell>R$ {row.value.toFixed(2)}</StyledTableCell>
                  </StyledTableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Box>
    </Box>
  )
}

export default ComissoesPage
