"use client"

import { useFormContext } from "react-hook-form"
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { healthQuestions } from "@/data/health-questions"

export default function Step5HealthQuestionnaire() {
  const { control, setValue, watch } = useFormContext()

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">Questionário de Saúde</h3>
        <p className="text-sm text-gray-500 mb-6">
          Por favor, responda às perguntas abaixo com sinceridade. Estas informações são importantes para a avaliação do
          seu plano de saúde.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <FormField
            control={control}
            name="peso"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Peso (kg)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Ex: 70"
                    {...field}
                    onChange={(e) => {
                      // Limit to 3 digits
                      if (e.target.value.length <= 3) {
                        field.onChange(e)
                      }
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="altura"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Altura (cm)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Ex: 170"
                    {...field}
                    onChange={(e) => {
                      // Limit to 3 digits
                      if (e.target.value.length <= 3) {
                        field.onChange(e)
                      }
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4">
          {healthQuestions.map((question, index) => (
            <Card key={question.id} className="p-4">
              <div className="space-y-3">
                <div className="font-medium">{question.question}</div>

                <FormField
                  control={control}
                  name={`respostas_saude.${index}.resposta`}
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex space-x-4"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Não" id={`q${question.id}-nao`} />
                            <Label htmlFor={`q${question.id}-nao`}>Não</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Sim" id={`q${question.id}-sim`} />
                            <Label htmlFor={`q${question.id}-sim`}>Sim</Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {watch(`respostas_saude.${index}.resposta`) === "Sim" && (
                  <FormField
                    control={control}
                    name={`respostas_saude.${index}.observacao`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Observações</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Forneça mais detalhes sobre sua resposta"
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
