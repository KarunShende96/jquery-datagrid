import "../css/dataGridStyle.scss";
(function ($) {
    $.fn.DataGrid = function (options) {
        //  columns = [
        //     {
        //         field: "",
        //         headerTitle: "",
        //         width: ""
        //         render: (cellValue, rowData, fieldName, rowIndex)=> {},
        //         type: "checkbox",
        //         sort: false,
        //         direction: ""  // "asc" | "desc",
        //     }
        // ]

        let defaults = {
            columns: [],
            data: []
        }
        const settings = $.extend({}, defaults, options);

        const self = $(this);
        const selfId = $(this).attr('id');

        function initialPageHtmlCreation() {
            $(`#${selfId} .dataGridContainer`).remove();
            let htmlData = '<div class="dataGridContainer">';
            htmlData += '<table id="example" class="table table-bordered" style="width: 100%;">'
            htmlData += '<thead>'
            htmlData += '<tr role="row">'
            $.each(settings.columns, (idx, colObj) => {
                if (colObj.type === "checkbox") {
                    htmlData += `<th data-type="checkbox" data-dt-column=${idx} name=${colObj.field} data-sort=${false} width=${colObj.width || ""} rowspan="1" colspan="1">
                                    <input id="grid-selectAll" data-field=${colObj.field} type="checkbox"></input>
                                </th>`
                }
                else {
                    htmlData += `<th class=${colObj.sort == false ? "": "cursor-pointer"} data-direction=${colObj.direction} data-dt-column=${idx} data-type=${colObj.type || "string"} name=${colObj.field} data-sort=${colObj.sort} width=${colObj.width || ""} rowspan="1" colspan="1"><span class="dataGrid-column-title">${colObj.headerTitle || ""}</span></th>`
                }
            })
            htmlData += '</tr></thead>'
            htmlData += '<tbody>'
            $.each(settings.data, (rowIdx, rowObj) => {
                htmlData += `<tr>`
                $.each(settings.columns, (colIdx, colObj) => {
                    if (colObj.type === "checkbox") {
                        htmlData += `<td data-dt-column=${colIdx} data-field=${colObj.field} >
                                        <input class="column-checkbox" data-field=${colObj.field} data-rowIdx=${rowIdx} type="checkbox" />
                                    </td>`
                    }
                    else {
                        if (colObj.render) {
                            htmlData += `<td data-type=${colObj.type} data-value=${rowObj[colObj.field]} data-dt-column=${colIdx} data-field=${colObj.field}>${colObj.render(rowObj[colObj.field], rowObj, colObj.field, rowIdx)}</td>`
                        }
                        else {
                            htmlData += `<td data-type=${colObj.type} data-value=${rowObj[colObj.field]} data-dt-column=${colIdx} data-field=${colObj.field}>${rowObj[colObj.field]}</td>`
                        }
                    }
                })
                htmlData += `</tr>`
            })
            htmlData += `</tbody></table></div>`

            return htmlData

        }

        self.append(initialPageHtmlCreation());

        // onchange of selectAll checkbox
        $(`#${selfId} .dataGridContainer th>input[type="checkbox"]#grid-selectAll`).on("change", function (e) {
            //check uncheck column checkboxes
            $(`#${selfId} .dataGridContainer tbody td>input[type="checkbox"].column-checkbox`).each(function (idx, item) {
                const dataField = e.target.getAttribute("data-field")
                settings.data[idx][dataField] = e.target.checked
                item.checked = e.target.checked

            })
        })

        // onchange of single checkbox
        const allCheckboxes = $(`#${selfId} .dataGridContainer tbody td>input[type="checkbox"].column-checkbox`)
        allCheckboxes.each(function (idx) {
            $(this).on("change", function (e) {
                const dataField = e.target.getAttribute("data-field")
                settings.data[idx][dataField] = e.target.checked
                // check for selectAll check box
                const allChecked = settings.data.filter(x => x[dataField] === true);
                const selectAllCheckBox = $(`#${selfId} .dataGridContainer th>input[type="checkbox"]#grid-selectAll`)
                if (allChecked.length > 0 && allChecked.length === allCheckboxes.length) {
                    selectAllCheckBox[0].checked = true
                }
                else {
                    selectAllCheckBox[0].checked = false
                }
            })
        })

        function transform(content, dataType) {
            //  Get the data type of column
            if (dataType === 'number'){
                return Number(content)
            }
            else if(dataType === "date"){
                //only support mm/dd/yyyy sequence i.e month comes before date
                const date = new Date(content)
                return date.valueOf()
            }
            else
                return content
        }

        // $(`#${selfId} .dataGridContainer th *`).on("click", function (e) {
        //     e.preventDefault()
        // })

        // sort on header click
        $(`#${selfId} .dataGridContainer th`).on("click", function (e) {
            let header = e.target
            if(header.tagName !== "TH"){
                header = e.target.closest("th")
            }
            const dataSort = header.getAttribute("data-sort");
            if (dataSort == false) return;
            const dataField = header.getAttribute("name");
            let direction = header.getAttribute("data-direction");
            const dataType = header.getAttribute("data-type");
            const rows = $(`#${selfId} .dataGridContainer tbody tr`);
            if(!direction || direction === "desc"){
                direction = "asc"
            }
            else{
                direction = "desc"
            }
            const multiplier = direction == 'desc' ? -1 : 1;
            const newRows = Array.from(rows);
            newRows.sort((rowA, rowB) => {
                let cellA = rowA.querySelectorAll(`td[data-field="${dataField}"]`)[0].innerText;
                let cellB = rowB.querySelectorAll(`td[data-field="${dataField}"]`)[0].innerText;
                if(rowA.querySelectorAll(`td[data-field="${dataField}"][data-type="date"]`).length){
                    cellA = rowA.querySelectorAll(`td[data-field="${dataField}"]`)[0].getAttribute("data-value");
                    cellB = rowB.querySelectorAll(`td[data-field="${dataField}"]`)[0].getAttribute("data-value")
                }
                const a = transform(cellA, dataType)
                const b = transform(cellB, dataType)
                if (a > b)
                    return 1 * multiplier
                else if (a < b)
                    return -1 * multiplier
                else
                    return 0
            });

            rows.each((idex, row) =>
                row.remove()
            )
            header.setAttribute("data-direction",direction);
            newRows.forEach((newRow) =>
                $(`#${selfId} .dataGridContainer tbody`).append(newRow)
            )
        })

        return self
    }
}(jQuery)
);