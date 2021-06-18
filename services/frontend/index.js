function newBook(book) {
    const div = document.createElement('div');
    div.className = 'column is-4';
    div.innerHTML = `
        <div class="card is-shady">
            <div class="card-image">
                <figure class="image is-4by3">
                    <img
                        src="${book.photo}"
                        alt="${book.name}"
                        class="modal-button"
                    />
                </figure>
            </div>
            <div class="card-content">
                <div class="content book" data-id="${book.id}">
                    <div class="book-meta">
                        <p class="is-size-4">R$${book.price.toFixed(2)}</p>
                        <p class="is-size-6 quant">Disponível em estoque: ${book.quantity}</p>
                        <h4 class="is-size-3 title">${book.name}</h4>
                        <p class="subtitle">${book.author}</p>
                    </div>
                    <div class="field has-addons">
                        <div class="control">
                            <input class="input" type="text" placeholder="Digite o CEP" />
                        </div>
                        <div class="control">
                            <a class="button button-shipping is-info" data-id="${book.id}"> Calcular Frete </a>
                        </div>
                    </div>
                    <button class="button botaobuy is-success is-fullwidth" data-id=" ${book.id} "> Comprar </button>
                </div>
            </div>
        </div>`;
    return div;
}

function calculateShipping(cep) {
    fetch('http://localhost:3000/shipping/' + cep)
        .then((data) => {
            if (data.ok) {
                return data.json();
            }
            throw data.statusText;
        })
        .then((data) => {
            swal('Frete', `O frete é: R$${data.value.toFixed(2)}`, 'success');
        })
        .catch((err) => {
            swal('Erro', 'Erro ao consultar frete', 'error');
            console.error(err);
        });
}
function AtualizarEstoque(quantidade, id){

    if (quantidade <= 0){

        $(".botaobuy")[id].setAttribute("disabled", "");

    }else {

        $(".botaobuy")[id].removeAttribute("disabled", "");

    }
}
function DecrementarEstoque(id) {
    fetch('http://localhost:3000/RemoveLivros/' + id)
        .then((data) => {
            if (data.ok) {
                id--
                return data.json();
            }
            throw data.statusText;
        })
        .then(function (data) {
            if (data.quantity >= 0){
                let tag = document.querySelectorAll(`.book .quant`)[id];
                var text = document.createTextNode(`Disponível em estoque: ${data.quantity}`);
                tag.replaceChild(text, tag.childNodes[0]);
            }else {

                swal('Erro', 'Não existe inventário restante!', 'error');
            }

            AtualizarEstoque(data.quantity, id);
        })
        .catch((err) => {
            swal('Erro', ' Algo deu errado!', 'error');
            console.error(err);
        });
}


document.addEventListener('DOMContentLoaded', function () {
    const books = document.querySelector('.books');
    fetch('http://localhost:3000/products')
        .then((data) => {
            if (data.ok) {
                return data.json();
            }
            throw data.statusText;
        })
        .then((data) => {
            if (data) {
                data.forEach((book) => {
                    books.appendChild(newBook(book));

                    AtualizarEstoque(book.quantity, book.id - 1);
                });

                document.querySelectorAll('.button-shipping').forEach((btn) => {
                    btn.addEventListener('click', (e) => {
                        const id = e.target.getAttribute('data-id');
                        const cep = document.querySelector(`.book[data-id="${id}"] input`).value;
                        calculateShipping(cep);
                    });
                });

                document.querySelectorAll('.botaobuy').forEach((btn) => {
                    btn.addEventListener('click', (e) => {                    
                        const id = e.target.getAttribute('data-id');
                        DecrementarEstoque(id);
                        swal('Compra de livros', 'Compra realizada com sucesso!', 'success');
                    });
                });
            }
        })
        .catch((err) => {
            swal('Erro', 'Erro ao listar os produtos', 'error');
            console.error(err);
        });
});
