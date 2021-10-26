var anchoSvg = 1000,
    altoSvg = 600,
    margen = {sup:60,dcho:400,izq:50,inf:100},
    ancho_grafica = anchoSvg - margen.izq - margen.dcho,
    alto_grafica = altoSvg - margen.sup - margen.inf; 

var json_data = "http://servicios.ine.es/wstempus/js/es/DATOS_TABLA/t04/p01/serie/01002.px?tip=AM"

d3.json(json_data).then((datos) => {
    //callback cuando se reciban los datos
    console.log(datos)
    
    var nuevosDatos = datos
        .filter(d => d.MetaData[1].Nombre == "86  CNAE 341. Fabricaci\u00F3n de veh\u00EDculos de motor")
        .map(d => 
             {var nDicc = new Object();
                nDicc.Combustible=d.MetaData[2].Nombre,
                nDicc.Fecha= parseInt(d.MetaData[0].Nombre),
                nDicc.Valor= d.Data[0].Valor;
            return nDicc})   

        .reduce(function (red, ac) {
        red[ac.Combustible] = red[ac.Combustible] || [];
        red[ac.Combustible].push({"Fecha":ac.Fecha,"Valor":ac.Valor});
        return red;
    }, Object.create(null));
    
    var datosFinales = new Array()
        Object.keys(nuevosDatos).forEach(d=>{
            var nObj = new Object();
            nObj.Combustible = d;
            nObj.Datos= nuevosDatos[d]
        datosFinales.push(nObj)
        }
        
    )
    
    console.log(datosFinales);
    
    //hacer accesible los datos desde la consola (solo hacer en clase)    
    window.nuevosDatos= datosFinales
    
    //Escala X
    var escalaX = d3.scaleLinear()
        .domain([2001,2007])
        .range([margen.izq,ancho_grafica+margen.izq])
    
    //Escala Y
    var lista = new Array();
        datosFinales.forEach(d=> {
                d.Datos.forEach(d=> {
                    lista.push(d.Valor)
                })
            })
    var escalaY = d3.scaleLinear()
        .domain(d3.extent(lista))
     
    //el [5] tendrá los valores máximos de y
        .range([alto_grafica+margen.sup,margen.sup]) //Al revés porque sino el cero del eje estará arriba
    
    //Escala para el color
    var escalaColor = d3.scaleLinear()
        .domain([0,1,2,3,4,5])
        .range(['red','blue','green','orange','purple','brown'])
    
    var elementoSvg = d3.select('body')
        .append('svg')
        .attr('width', anchoSvg)
        .attr('height', altoSvg)
        .attr('margin',margen)
    
    var linea = d3.line()
      .x(d => escalaX(d.Fecha))
      .y(d => escalaY(d.Valor))

    var lineas = elementoSvg
        .append('g')
        .attr('class', 'grupo-lineas')

    lineas

        .selectAll('.lineas')
        .data(datosFinales)
        .enter()
        .append('g')
        .attr('class','lineas')
        .append('path')
        .attr('class','linea')
        .attr('d',d=>linea(d.Datos))
        .style('stroke', (d, i) =>  escalaColor(i))
        //.style('stroke-width',4)
        .on('mouseover', function(d,i) {
            d3.selectAll('.linea')
                .attr('class','linea-oculta')
            d3.select(this)
                .attr('class','hover')
            d3.selectAll('.leyendas')
                .attr('class','leyendas-h')
            
            d3.select('#leyenda-'+i)
                .attr('class','leyendas-nh')
        
        elementoSvg //Añado etiquetas de texto y les paso el valor de "Valor"
            .append('g')
            .attr('class','textos etiquetas')
            .selectAll('text')
            .data(d.Datos)
            .enter()
            .append('text')
            .text(d=>d.Valor)
            .attr('x',d=> escalaX(d.Fecha) + 5)
            .attr('y',d=> escalaY(d.Valor) - 30)    
        
        })
    
        .on('mouseout', function(d) {
            d3.selectAll('.etiquetas')
                .remove()  
            d3.selectAll('.linea-oculta')
                .attr('class','linea')
            d3.select(this)
			    .attr('class','linea')
            d3.select('.leyendas-nh') //vuelvo a poner las leyendas normal
                .attr('class','leyendas')
            d3.selectAll('.leyendas-h')
                .attr('class','leyendas')
        })
    
        //Añado la leyenda de cada línea
            .append("g")
            .select('text')
            .data(datosFinales)
            .enter()
            .append('text')
            .attr('class','leyendas')
            .attr('id',(d,i)=>'leyenda-'+i)
            .text(d=>d.Combustible)
            .attr('x',d=> escalaX(d.Datos[3].Fecha) + 20)
            .attr('y',d=> escalaY(d.Datos[3].Valor) + 5)
            .attr('fill',(d, i) =>  escalaColor(i))
    
    //Añado el eje X
    var formatoAnnio = d3.format('.0f');    
    var ejeX = d3.axisBottom(escalaX)
        .tickValues([2001,2003,2005,2007])
        .tickFormat(formatoAnnio)
        elementoSvg
            .append("g")
            .attr('class','ejeX')
            .attr('transform', 'translate(0,' + (alto_grafica+margen.sup) + ')')
            .call(ejeX)

    //Añado el título del gráfico
    elementoSvg
        .append('text')
        .attr('class','textos')
        .text('Consumos energ\u00E9ticos por producto en la Fabricaci\u00F3n de veh\u00EDculos a motor (miles de \u20ac)')
        .attr('transform', 'translate(100,' + (alto_grafica+margen.sup + 80) + ')')
})
