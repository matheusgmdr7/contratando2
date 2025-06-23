"use client"

import { useFormContext } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { FileText, CheckCircle } from "lucide-react"

export default function Step1SelectTemplate({ templates, corretorPredefinido }) {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext()

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">Identificação do Corretor</h3>

        {corretorPredefinido ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              <div>
                <p className="font-medium text-green-800">Corretor Selecionado</p>
                <p className="text-green-600">{corretorPredefinido.nome}</p>
              </div>
            </div>
          </div>
        ) : (
          <FormField
            control={control}
            name="corretor_nome"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome do Corretor</FormLabel>
                <FormControl>
                  <Input placeholder="Digite o nome do corretor" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4">Selecione o Modelo de Proposta</h3>

        <FormField
          control={control}
          name="template_id"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormControl>
                <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="space-y-3">
                  {templates.map((template) => (
                    <Card
                      key={template.id}
                      className={`p-4 cursor-pointer transition-all ${
                        field.value === template.id.toString() ? "border-[#168979] border-2" : "hover:border-gray-300"
                      }`}
                      onClick={() => {
                        field.onChange(template.id.toString())
                        // Adicione um foco visual no botão de rádio
                        document.getElementById(`template-${template.id}`).focus()
                      }}
                    >
                      <div className="flex items-start space-x-3">
                        <RadioGroupItem
                          value={template.id.toString()}
                          id={`template-${template.id}`}
                          className="mt-1 cursor-pointer"
                        />
                        <div className="flex-1 cursor-pointer">
                          <Label
                            htmlFor={`template-${template.id}`}
                            className="text-base font-medium cursor-pointer"
                            onClick={(e) => {
                              // Evite propagação para não duplicar o evento
                              e.stopPropagation()
                              field.onChange(template.id.toString())
                            }}
                          >
                            {template.titulo}
                          </Label>
                          <div className="text-sm text-gray-500 mt-1">
                            {template.descricao || "Sem descrição disponível"}
                          </div>
                          <div className="flex items-center mt-2 text-sm text-gray-600">
                            <FileText className="h-4 w-4 mr-1" />
                            {template.arquivo_nome || template.produto_nome || "Documento PDF"}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  )
}
