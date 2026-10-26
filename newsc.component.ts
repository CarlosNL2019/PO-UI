import { HttpClient } from '@angular/common/http';
import { Component, inject, Injectable, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ForceOptionComponentEnum, PoButtonModule, PoDynamicFormField, PoDynamicFormComponent} from '@po-ui/ng-components';
import { PoDynamicModule, PoNotificationService, PoPageModule, PoDynamicFormFieldChanged } from '@po-ui/ng-components';
import { PoDynamicFormFieldValidation, PoDynamicFormValidation, ForceBooleanComponentEnum  } from '@po-ui/ng-components';
import { environment } from '../../../environments/environment';
import { ProfileService } from '../../services/profile.service';
import { PoLoadingModule } from '@po-ui/ng-components';

@Component({
  selector: 'app-newsc',
  standalone: true,
  imports: [PoDynamicModule,PoButtonModule,PoPageModule,PoLoadingModule],
  templateUrl: './newsc.component.html',
  styleUrl: './newsc.component.css'
})

@Injectable({
  providedIn: 'root'
})

export class NewscComponent implements OnInit {

  ngOnInit(): void {

    this.initialValues = {
      numsc: '000000',                       // Dúvida: como obter o último numero da SC na SC1.
      solicitante: this.nameSolicit,
      itproj: 'N',
      emissao: this.dataAtual,
      fields: [
          {
            property: 'projeto',
            disabled: this.isDisabled
          }
        ]
    };
  }

  private dataAtual = new Date().toISOString().split('T')[0]; 
  private isDisabled: boolean = true;
  private profileService = inject(ProfileService);
  private nameSolicit: string = this.profileService.nomedeUsuario;
  private http = inject(HttpClient);
  private route = inject(Router);
  private url: string = environment.url;
  private notify = inject(PoNotificationService);
  
  initialValues = {};

  public fields: PoDynamicFormField[] = [
    {
     property: 'numsc', 
     label: 'Num SC', 
     required: true, 
     gridColumns:  1, 
     gridSmColumns: 12, 
     maxLength: 6
    },
    {
      property: 'itemsc', 
      label: 'Item', 
      required: true, 
      gridColumns:  1, 
      gridSmColumns: 12,
      maxLength: 4
    },
    {
     property: 'solicitante', 
     label: 'Solicitante',    
     disabled: true,             
     gridColumns: 4, 
     gridSmColumns: 12 
    },
    {
     property: 'emissao', 
     label: 'Dt. Emissão', 
     readonly: true, 
     gridColumns: 2, 
     gridSmColumns: 12, 
     type: 'date'
    },
    {
     property: 'codpro', 
     label: 'Produto', 
     required: true, 
     placeholder: 'Informe o produto',
     gridColumns:  9, 
     gridSmColumns: 12,
     searchService: `${this.url}/curso/api/endereco?recurso=prd`,
     columns: [
       {property: 'codpro'    , label: 'Código'},
       {property: 'descricao' , label: 'Descrição'}
     ],
     format: ['codpro',' - ','descricao'],
     fieldValue: 'codpro',
     fieldLabel: 'descricao'
    },
    {property: 'qtde'        , label: 'Qtde'                  , required: true, gridColumns:  2, gridSmColumns: 12},
    {property: 'und'         , label: 'Und'                   , readonly: true, gridColumns:  1, gridSmColumns: 12, decimalsLength: 3},
    {property: 'desccompl'   , label: 'Descrição Complementar',                 gridColumns: 12, gridSmColumns: 12},
    {property: 'entrega'     , label: 'Local de Entrega',                       gridColumns:  3, gridSmColumns: 12, options: [
        {label:'Empresa I'  , value: '01'},
        {label:'Empresa II' , value: '02'}
      ],
      fieldLabel: 'label',
      fieldValue: 'value',
      forceOptionsComponentType: ForceOptionComponentEnum.select,
    },
    {property: 'prioridade'  , label: 'Prioridade',                            gridColumns:  2, gridSmColumns: 12,options: [
        {label:'Normal' , value: 'N'},
        {label:'Outros' , value: 'O'}
      ],
      fieldLabel: 'label',
      fieldValue: 'value',
      forceOptionsComponentType: ForceOptionComponentEnum.select,
    },
    {
     property: 'tiposc', 
     label: 'Tipo SC', 
     gridColumns:  2, 
     gridSmColumns: 12,
     options: [
               { label: 'Pedido'  , value: '1'},
               { label: 'Contrato', value: '2'}
              ],
      fieldLabel: 'label',
      fieldValue: 'value',
      forceOptionsComponentType: ForceOptionComponentEnum.select,
    },
    {property: 'necessidade' , label: 'Necessidade' , gridColumns:  2, gridSmColumns: 12, type: 'date'},
    {
     property: 'ccusto', 
     label: 'Centro de Custo', 
     required: true,
     gridColumns: 12, 
     gridSmColumns: 12,
     searchService: `${this.url}/curso/api/endereco?recurso=ctt`,
     columns: [
       {property: 'ccusto'   , label: 'Código'},
       {property: 'descricao', label: 'Descrição'}
     ],
     format: ['ccusto',' - ','descricao'],
     fieldValue: 'ccusto',
     fieldLabel: 'descricao'
    },
    {
     property: 'fornecedor', 
     label: 'Fornecedor',
     gridColumns: 12, 
     gridSmColumns: 12,
     searchService: `${this.url}/curso/api/endereco?recurso=frn`,
     columns: [
       {property: 'fornece' , label: 'Código'},
       {property: 'loja'    , label: 'Loja'},
       {property: 'razsoc'  , label: 'Razão Social'}
     ],
     format: ['fornece','loja',' - ','razsoc'],
     fieldValue: 'fornece',
     fieldLabel: 'razsoc'
    },
    {
     property: 'itproj', 
     label: 'Projeto?', 
     required: true,   
     gridColumns:  2, 
     gridSmColumns: 12, 
     options: [
               { label: 'Sim' , value: 'S'},                       // habilita 'projeto' para buscar o numero do projeto na AF8
               { label: 'Não' , value: 'N'},                       // desabilita 'projeto' e deve apagar o numero do projeto se houve uma seleção anterior com 'Sim'
              ],
      validate: this.onChangeValue.bind(this),
      fieldLabel: 'label',
      fieldValue: 'value',
      forceOptionsComponentType: ForceOptionComponentEnum.select,
    },
    {
     property: 'projeto', 
     label: 'Cód. Projeto',
     disabled: true,                                               // Aqui deve ser alterado a partir do property 'itproj', acima (se sim, habilita. se não, desabilita)
     readonly: true,
     gridColumns:  6, 
     gridSmColumns: 12,
     searchService: `${this.url}/curso/api/endereco?recurso=prj`,
     columns: [
       {property: 'codprj'    , label: 'Código'},
       {property: 'descricao' , label: 'Descrição'}
     ],
     format: ['codprj',' - ','descricao'],
     fieldValue: 'codprj',
     fieldLabel: 'descricao'
    },
    {property: 'contrato'    , label: 'Contrato'          ,                   gridColumns:  4, gridSmColumns: 12},
    {property: 'observ'      , label: 'Observação Interna', rows: 5,          gridColumns:  6, gridSmColumns: 12},
  
    {property: 'image', 
     type: 'upload',
     gridColumns:  6, 
     gridSmColumns: 12,
     label: 'Anexo',        
     optional: true,
     url: https://po-sample-api.onrender.com/v1/uploads/addFile'
    }

  ];
  
  onChangeValue(changedField: PoDynamicFormFieldChanged): PoDynamicFormFieldValidation {
    
    let retVal: any = {value: changedField.value};
    
    if ( changedField.property === 'itproj' ) {
      const optionProj = changedField.value;
      const field = this.fields.find(f => f.property === 'projeto');
      if ( optionProj === 'S' || optionProj === 'N'  ) { 
        this.isDisabled = optionProj === 'S' ? false : true;
        retVal = {
                fields: [
                    {
                     property: 'projeto',
                     disabled: this.isDisabled
                    }
                  ]
        };
  
        return retVal;
  
      };
      
    };
    
    return {};
  }

  public confirmForm(form: any){
    this.http.post<any>(`${this.url}/curso/api/solcompras`,form)
    .subscribe({
      next: value => this.notify.success({duration: 2000,message: `Nova SC: ${value.numsc}`}),
      error: err => this.notify.error(err.error.status),
      complete: () => this.route.navigate(['/solicitacao'])
    })
  }

  public cancelaForm(form: any){
    this.route.navigate(['/solicitacao'])
  }

}
