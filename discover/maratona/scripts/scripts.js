const Modal = {
    open(){
        // Abre o modal
        // Adiciona a class active no modal
        document.querySelector('.modal-overlay')
        .classList.add('active')
    },
    close(){
        // Fecha o modal
        // Remove a class active do modal
        document.querySelector('.modal-overlay')
        .classList.remove('active')
    }
}

const Storage = {
    get() {
        return JSON.parse(localStorage.getItem('dev.finances:transactions')) || []
    },

    set (transactions) {
        localStorage
        .setItem("dev.finances:transactions", 
        JSON.stringify(transactions))
    }
}

// funções para manipular as transações
 const Transaction = {
    // função: array para armazenar transações
    all: Storage.get(),

    add(transaction) {
        Transaction.all.push(transaction)

        App.reload()
    },

    remove(index) {
        Transaction.all.splice(index, 1)

        App.reload()
    },
    
    incomes() {
        let income = 0;
        Transaction.all.forEach(transaction => {
            if (transaction.amount > 0) {
                income = income + transaction.amount;
            }
        })
        return income;
    },

    expenses() {
        let expense = 0;
        Transaction.all.forEach(transaction => {
            if(transaction.amount < 0) {
                expense = expense + transaction.amount;
            }
        })
        return expense;
    },

    total() {
        return Transaction.incomes() + Transaction.expenses();
    },
}

// funções para pegar os dados e mostrar no html
const DOM = {
    transactionsContainer: document.querySelector('#data-table tbody'),

    addTransaction(transaction, index) {
        const tr = document.createElement('tr')
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index)
        tr.dataset.index = index

        DOM.transactionsContainer.appendChild(tr)
    },

    innerHTMLTransaction(transaction, index) {
        const CSSclass = transaction.amount > 0 ? "income" : "expense"

       const amount = Utils.formatCurrency(transaction.amount)

        const html = `
        <td class="description">${transaction.description}</td>
        <td class=${CSSclass}>${amount}</td>
        <td class="date">${transaction.date}</td>
        <td>
            <img onclick="Transaction.remove(${index})" src="../assets/minus.svg" alt="Remover transação">
        </td>
        `
        return html
    },

    updateBalance() {
        // Soma entradas
        document
        .getElementById('incomeDisplay')
        .innerHTML = Utils.formatCurrency(Transaction.incomes())

        // Soma saídas
        document
        .getElementById('expenseDisplay')
        .innerHTML = Utils.formatCurrency(Transaction.expenses())

        // Total
        document
        .getElementById('totalDisplay')
        .innerHTML = Utils.formatCurrency(Transaction.total())

    },

    clearTransaction() {
        DOM.transactionsContainer.innerHTML = ""
    }
}

// formatação de valor (css)
const Utils = {
    formatAmonut(value) {
        value = Number(value) * 100
        
        return value
    },

    formatDate(date) {
        const splittedDate = date.split("-")

         return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
        //console.log(splittedDate)
    },

    formatCurrency(value) {
        const signal = Number(value) < 0 ? "-" : ""

        value =String(value).replace(/\D/g, "")

        value = Number(value) / 100

        value = value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        })

        return signal + value
    }
}

const Form = {
    // captura os dados do formulario
    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),

   // retorna os valores capturados
   getValues() {
        return {
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value,
        }
   },
   
    // verifica se todas as informções foram preenchidas
    validateFields() {
        const { description, amount, date } = Form.getValues()
        
        if( description.trim() === "" ||
            amount.trim() === "" ||
            date.trim() === "" ) {
                throw new Error("Por favor, preencha todos os campos.")
        }
    },

    // formata os dados do formulario e retorna
    formatData() {
        let { description, amount, date } = Form.getValues()

        amount = Utils.formatAmonut(amount)

        date = Utils.formatDate(date)

        return {
            description,
            amount,
            date
        }
    },

    // salva os dados do formulario
    saveTransaction(transaction) {
        Transaction.add(transaction)
    },

    // limpa formulario
    clearFields() {
        Form.description.value = ""
        Form.amount.value = ""
        Form.date.value = ""
    },
    
    submit(event) {
        event.preventDefault()

        try {
            Form.validateFields()
            const transaction =  Form.formatData()
            Form.saveTransaction(transaction)
            Form.clearFields()

            Modal.close() 
            
        } catch (error) {
            alert(error.message)
        }
    }
}

const App = {
    init() {
        // Está pegando todas as transações de dentro do array da função transaction(adicionando na DOM)
        Transaction.all.forEach((transaction, index) => {
        DOM.addTransaction(transaction, index)
        })

        // Atualizando na DOM
        DOM.updateBalance();

        // Inserindo todas as transações
        Storage.set(Transaction.all)

    },
    reload() {
        DOM.clearTransaction()
        App.init()
    },
}

App.init();